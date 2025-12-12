const express = require('express');
const { pool, query } = require('../db'); // <- on ajoute pool
const router = express.Router();

// Helper de validation
const isPositiveInt = (v) => Number.isInteger(v) && v > 0;

// -----------------------------
// Lister toutes les soumissions
// -----------------------------
router.get('/', async (req, res) => {
    try {
        const result = await query(`
            SELECT id_soumission, participant_id, date_remplissage
            FROM soumission
            ORDER BY id_soumission DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('GET /soumission error :', err);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des soumissions' });
    }
});

// -----------------------------
// Récupérer une soumission par ID
// -----------------------------
router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!isPositiveInt(id)) return res.status(400).json({ error: 'ID invalide' });

    try {
        const result = await query(`
            SELECT id_soumission, participant_id, date_remplissage
            FROM soumission
            WHERE id_soumission = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Soumission non trouvée' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(`GET /soumission/${id} error :`, err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// -----------------------------
// Créer une nouvelle soumission
// -----------------------------
router.post('/', async (req, res) => {
    const { participant_id, date_remplissage } = req.body;

    const pid = parseInt(participant_id, 10);
    if (!isPositiveInt(pid)) {
        return res.status(400).json({ error: '"participant_id" doit être un entier positif' });
    }

    try {
        const result = await query(`
            INSERT INTO soumission (participant_id, date_remplissage)
            VALUES ($1, CURRENT_DATE)
            RETURNING id_soumission, participant_id, date_remplissage
        `, [pid, date_remplissage || null]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('POST /soumission error :', err);

        if (err.code === '23503') {
            return res.status(400).json({ error: 'Le participant référencé est introuvable' });
        }
        if (err.code === '23505') {
            return res.status(400).json({
                error: 'Une soumission existe déjà pour ce participant à cette date'
            });
        }

        res.status(500).json({ error: 'Erreur serveur lors de la création de la soumission' });
    }
});

// -----------------------------
// Mettre à jour une soumission
// -----------------------------
router.put('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { participant_id, date_remplissage } = req.body;

    if (!isPositiveInt(id)) {
        return res.status(400).json({ error: 'ID invalide' });
    }

    const updates = [];
    const params = [];
    let i = 1;

    if (participant_id !== undefined) {
        const pid = parseInt(participant_id, 10);
        if (!isPositiveInt(pid)) {
            return res.status(400).json({ error: '"participant_id" doit être un entier positif' });
        }
        updates.push(`participant_id = $${i++}`);
        params.push(pid);
    }

    if (date_remplissage !== undefined) {
        updates.push(`date_remplissage = $${i++}`);
        params.push(date_remplissage);
    }

    if (updates.length === 0) {
        return res.status(400).json({ error: 'Aucun champ à mettre à jour' });
    }

    params.push(id);
    const sql = `
        UPDATE soumission
        SET ${updates.join(', ')}
        WHERE id_soumission = $${i}
        RETURNING id_soumission, participant_id, date_remplissage
    `;

    try {
        const result = await query(sql, params);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Soumission non trouvée' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(`PUT /soumission/${id} error :`, err);

        if (err.code === '23503') {
            return res.status(400).json({ error: 'Le participant référencé est introuvable' });
        }
        if (err.code === '23505') {
            return res.status(400).json({
                error: 'Conflit : cette combinaison (participant, date) existe déjà'
            });
        }

        res.status(500).json({ error: 'Erreur serveur lors de la mise à jour de la soumission' });
    }
});

// -----------------------------
// Créer une soumission + réponses (choix ou libre, même vides)
// -----------------------------
router.post('/complete', async (req, res) => {
    const client = await pool.connect(); // Utilisation correcte du client

    try {
        const { participant_id, questionnaire_id, reponses } = req.body;

        // Vérifications basiques
        if (!participant_id || !questionnaire_id || !Array.isArray(reponses)) {
            return res.status(400).json({
                error: 'Requête invalide : participant_id, questionnaire_id et reponses[] sont requis'
            });
        }

        await client.query('BEGIN');

        // Vérifier que le participant existe
        const checkParticipant = await client.query(
            `SELECT id_participant FROM participant WHERE id_participant = $1`,
            [participant_id]
        );
        if (checkParticipant.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Participant introuvable' });
        }

        // Vérifier que le questionnaire existe
        const checkQuestionnaire = await client.query(
            `SELECT id_questionnaire FROM questionnaire WHERE id_questionnaire = $1`,
            [questionnaire_id]
        );
        if (checkQuestionnaire.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Questionnaire introuvable' });
        }

        // Créer la soumission
        const soum = await client.query(
            `INSERT INTO soumission (participant_id)
             VALUES ($1)
             RETURNING id_soumission, date_remplissage`,
            [participant_id]
        );

        const idSoumission = soum.rows[0].id_soumission;

        // Parcourir les réponses (même vides)
        for (const rep of reponses) {
            const { question_id, choix_id, reponse_libre } = rep;

            if (!question_id) {
                await client.query('ROLLBACK');
                return res.status(400).json({
                    error: 'Chaque réponse doit contenir question_id'
                });
            }

            // Vérifier que la question appartient au questionnaire
            const checkQQ = await client.query(
                `SELECT 1 FROM question_questionnaire
                 WHERE question_id = $1 AND questionnaire_id = $2`,
                [question_id, questionnaire_id]
            );

            if (checkQQ.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({
                    error: `La question ${question_id} n’appartient pas au questionnaire ${questionnaire_id}`
                });
            }

            // Si choix_id présent, vérifier que le choix est valide pour la question
            if (choix_id !== null) {
                const checkQC = await client.query(
                    `SELECT 1 FROM question_choix
                     WHERE question_id = $1 AND choix_id = $2`,
                    [question_id, choix_id]
                );
                if (checkQC.rows.length === 0) {
                    await client.query('ROLLBACK');
                    return res.status(400).json({
                        error: `Le choix ${choix_id} n’est pas valide pour la question ${question_id}`
                    });
                }
            }

            // Insérer la réponse (même si vide)
            await client.query(
                `INSERT INTO reponse (soumission_id, question_id, choix_id, reponse_libre)
                 VALUES ($1, $2, $3, $4)`,
                [idSoumission, question_id, choix_id || null, reponse_libre || null]
            );
        }

        await client.query('COMMIT');

        res.status(201).json({
            message: 'Soumission et réponses enregistrées avec succès',
            soumission: {
                id_soumission: idSoumission,
                participant_id,
                questionnaire_id,
                date: soum.rows[0].date_remplissage
            }
        });

    } catch (err) {
        console.error('POST /soumission/complete error:', err);
        try { await client.query('ROLLBACK'); } catch (e) {}
        res.status(500).json({ error: 'Erreur serveur lors de la soumission complète' });
    } finally {
        client.release();
    }
});



// -------------------------------------------------------------
// GET /soumission/:id/complet
// Récupère : soumission + participant + réponses + questions + choix
// -------------------------------------------------------------
router.get('/:id/complet', async (req, res) => {
    const soumissionId = parseInt(req.params.id, 10);
    if (!Number.isInteger(soumissionId) || soumissionId <= 0) {
        return res.status(400).json({ error: 'ID de soumission invalide' });
    }

    try {
        const soumRes = await query(
            `SELECT s.id_soumission, s.date_remplissage,
                    p.id_participant, p.categorie_id
             FROM soumission s
             JOIN participant p ON p.id_participant = s.participant_id
             WHERE s.id_soumission = $1`,
            [soumissionId]
        );

        if (soumRes.rows.length === 0) {
            return res.status(404).json({ error: 'Soumission non trouvée' });
        }

        const soumission = {
            id_soumission: soumRes.rows[0].id_soumission,
            date_remplissage: soumRes.rows[0].date_remplissage,
            participant: {
                id_participant: soumRes.rows[0].id_participant,
                categorie_id: soumRes.rows[0].categorie_id
            }
        };

        const repRes = await query(
            `SELECT 
                r.id_reponse,
                r.reponse_libre,
                q.id_question,
                q.intitule AS question_intitule,
                q.type_question,
                c.id_choix,
                c.libelle AS choix_intitule
             FROM reponse r
             JOIN question q ON q.id_question = r.question_id
             LEFT JOIN choix c ON c.id_choix = r.choix_id
             WHERE r.soumission_id = $1
             ORDER BY r.id_reponse`,
            [soumissionId]
        );

        const reponses = repRes.rows.map(r => ({
            id_reponse: r.id_reponse,
            reponse_libre: r.reponse_libre,
            question: {
                id_question: r.id_question,
                intitule: r.question_intitule,
                type_question: r.type_question
            },
            choix: r.id_choix ? {
                id_choix: r.id_choix,
                libelle: r.choix_intitule
            } : null
        }));

        res.json({ soumission, reponses });

    } catch (err) {
        console.error(`GET /soumission/${soumissionId}/complet error :`, err);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des données complètes de la soumission' });
    }
});

// -----------------------------
// Supprimer une soumission
// -----------------------------
router.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!isPositiveInt(id)) return res.status(400).json({ error: 'ID invalide' });

    try {
        const result = await query(`
            DELETE FROM soumission
            WHERE id_soumission = $1
            RETURNING id_soumission
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Soumission non trouvée' });
        }

        res.json({
            message: 'Soumission supprimée',
            deletedId: result.rows[0].id_soumission
        });
    } catch (err) {
        console.error(`DELETE /soumission/${id} error :`, err);
        res.status(500).json({ error: 'Erreur serveur lors de la suppression' });
    }
});

module.exports = router;
