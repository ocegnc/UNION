const express = require('express');
const { query } = require('../db'); 
const router = express.Router();

// -----------------------------
// Lister tous les questionnaires
// -----------------------------
router.get('/', async (req, res) => {
    try {
        const result = await query(
//            'SELECT * FROM questionnaire ORDER BY id_questionnaire'
            `SELECT q.id_questionnaire, q.titre, c.categorie AS categorie
             FROM questionnaire q
             JOIN categorie c ON q.categorie_id = c.id_categorie
             ORDER BY q.id_questionnaire`
        );
        res.json(result.rows);
    } catch (err) {
        console.error('GET /questionnaire error', err);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des questionnaires' });
    }
});

// -----------------------------
// Récupèrer un questionnaire
// -----------------------------
router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'ID invalide' });

    try {
        const result = await query(
//            'SELECT * FROM questionnaire WHERE id_questionnaire = $1',
            `SELECT q.id_questionnaire, q.titre, c.categorie AS categorie
             FROM questionnaire q
             JOIN categorie c ON q.categorie_id = c.id_categorie
             WHERE q.id_questionnaire = $1`,
            [id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Questionnaire non trouvé' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(`GET /questionnaire/${id} error`, err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// -----------------------------
// Créer un nouveau questionnaire
// -----------------------------
router.post('/', async (req, res) => {
    const { categorie_id, titre} = req.body;

    if (!categorie_id || !Number.isInteger(categorie_id)) {
        return res.status(400).json({ error: "categorie_id doit être un entier" });
    }

    if (!titre || titre.trim() === "") {
        return res.status(400).json({ error: "Le champ titre est obligatoire" });
    }

    try {
        const result = await query(
            `INSERT INTO questionnaire (categorie_id, titre)
             VALUES ($1, $2)
             RETURNING id_questionnaire, categorie_id, titre`,
            [categorie_id, titre]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('POST /questionnaire error', err);
        res.status(500).json({ error: 'Erreur serveur lors de la création du questionnaire' });
    }
});

// -----------------------------
// Mettre à jour un questionnaire
// -----------------------------
router.put('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'ID invalide' });

    const { categorie_id, titre } = req.body;

    const fields = [];
    const values = [];

    if (categorie_id !== undefined) {
        if (!Number.isInteger(categorie_id))
            return res.status(400).json({ error: "categorie_id doit être un entier" });
        fields.push(`categorie_id = $${fields.length + 1}`);
        values.push(categorie_id);
    }

    if (titre !== undefined) {
        if (titre.trim() === "")
            return res.status(400).json({ error: "titre ne peut pas être vide" });
        fields.push(`titre = $${fields.length + 1}`);
        values.push(titre);
    }

    if (!fields.length)
        return res.status(400).json({ error: 'Aucun champ valide à mettre à jour' });

    values.push(id);

    try {
        const sql = `
            UPDATE questionnaire
            SET ${fields.join(', ')}
            WHERE id_questionnaire = $${values.length}
            RETURNING *
        `;
        const result = await query(sql, values);

        if (result.rows.length === 0)
            return res.status(404).json({ error: 'Questionnaire non trouvé' });

        res.json(result.rows[0]);
    } catch (err) {
        console.error(`PUT /questionnaire/${id} error`, err);
        res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du questionnaire' });
    }
});

// -----------------------------
// Endpoint GET pour récupérer un questionnaire complet (questions + choix ) par catégorie
// -----------------------------

router.get('/:categorie/complet', async (req, res) => {
    const categorie = req.params.categorie.toLowerCase().trim();

    try {
        // 1) Vérifier que la catégorie existe et récupérer le questionnaire associé
        const questionnaireRes = await query(
            `SELECT q.id_questionnaire, q.titre
             FROM questionnaire q
             JOIN categorie cat ON q.categorie_id = cat.id_categorie
             WHERE LOWER(cat.categorie) = $1`,
            [categorie]
        );

        if (questionnaireRes.rows.length === 0) {
            return res.status(404).json({ error: 'Aucun questionnaire trouvé pour cette catégorie' });
        }

        const questionnaireId = questionnaireRes.rows[0].id_questionnaire;

        // 2) Récupérer questions + choix
        const qcRes = await query(
            `SELECT 
                q.id_question,
                q.intitule AS question_libelle,
                c.id_choix,
                c.libelle AS choix_libelle
            FROM question_questionnaire qq
            JOIN question q ON qq.question_id = q.id_question
            LEFT JOIN question_choix qc ON q.id_question = qc.question_id
            LEFT JOIN choix c ON qc.choix_id = c.id_choix
            WHERE qq.questionnaire_id = $1
            ORDER BY q.id_question, c.id_choix`,
            [questionnaireId]
        );

        // 3) Regrouper Questions → choix
        const questionsMap = {};

        qcRes.rows.forEach(row => {
            if (!questionsMap[row.id_question]) {
                questionsMap[row.id_question] = {
                    id_question: row.id_question,
                    intitule: row.question_libelle,
                    choix: []
                };
            }

            if (row.id_choix) {
                questionsMap[row.id_question].choix.push({
                    id_choix: row.id_choix,
                    libelle: row.choix_libelle
                });
            }
        });

        res.json({
            categorie: categorie,
            id_questionnaire: questionnaireId,
            titre: questionnaireRes.rows[0].titre,
            questions: Object.values(questionsMap)
        });

    } catch (err) {
        console.error('GET /questionnaire/:categorie/complet error :', err);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération du questionnaire par catégorie' });
    }
});

// -----------------------------
// Endpoint GET pour récupérer un questionnaire complet (questions + choix ) par id du questionnaire
// -----------------------------

router.get('/:id/complet', async (req, res) => {
    const questionnaireId = parseInt(req.params.id, 10);
    if (!Number.isInteger(questionnaireId) || questionnaireId <= 0) {
        return res.status(400).json({ error: 'ID questionnaire invalide' });
    }

    try {
        // 1) Récupération du questionnaire
        const qRes = await query(
            `SELECT id_questionnaire, titre
             FROM questionnaire
             WHERE id_questionnaire = $1`,
            [questionnaireId]
        );

        if (qRes.rows.length === 0) {
            return res.status(404).json({ error: 'Questionnaire non trouvé' });
        }

        // 2) Récupération des questions + choix
        const qcRes = await query(
            `SELECT 
                q.id_question,
                q.intitule AS question_libelle,
                c.id_choix,
                c.libelle AS choix_libelle
            FROM question_questionnaire qq
            JOIN question q ON qq.question_id = q.id_question
            LEFT JOIN question_choix qc ON q.id_question = qc.question_id
            LEFT JOIN choix c ON qc.choix_id = c.id_choix
            WHERE qq.questionnaire_id = $1
            ORDER BY q.id_question, c.id_choix`,
            [questionnaireId]
        );

        // 3) Transformation → regrouper les choix par question
        const questionsMap = {};

        qcRes.rows.forEach(row => {
            if (!questionsMap[row.id_question]) {
                questionsMap[row.id_question] = {
                    id_question: row.id_question,
                    intitule: row.question_libelle,
                    choix: []
                };
            }

            if (row.id_choix) {
                questionsMap[row.id_question].choix.push({
                    id_choix: row.id_choix,
                    libelle: row.choix_libelle
                });
            }
        });

        // 4) Conversion en tableau ordonné
        const questionsArray = Object.values(questionsMap);

        res.json({
            id_questionnaire: qRes.rows[0].id_questionnaire,
            titre: qRes.rows[0].titre,
            questions: questionsArray
        });

    } catch (err) {
        console.error(`GET /questionnaire/${questionnaireId}/complet error :`, err);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération du questionnaire complet' });
    }
});

// -----------------------------
// Supprimer un questionnaire
// -----------------------------
router.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'ID invalide' });

    try {
        const result = await query(
            'DELETE FROM questionnaire WHERE id_questionnaire = $1 RETURNING id_questionnaire',
            [id]
        );
        if (result.rows.length === 0)
            return res.status(404).json({ error: 'Questionnaire non trouvé' });
        res.json({ message: 'Questionnaire supprimé', deletedId: result.rows[0].id_questionnaire });
    } catch (err) {
        console.error(`DELETE /questionnaire/${id} error`, err);
        res.status(500).json({ error: 'Erreur serveur lors de la suppression du questionnaire' });
    }
});

module.exports = router;
