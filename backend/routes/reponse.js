const express = require('express');
const { query } = require('../db');
const router = express.Router();

const isPositiveInt = (v) => Number.isInteger(v) && v > 0;

// -----------------------------
// Lister toutes les réponses
// -----------------------------
router.get('/', async (req, res) => {
    try {
        const result = await query(`
            SELECT id_reponse, soumission_id, question_id, choix_id, reponse_libre
            FROM reponse
            ORDER BY id_reponse
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('GET /reponse error :', err);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des réponses' });
    }
});

// -----------------------------
// Récupérer une réponse par ID
// -----------------------------
router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!isPositiveInt(id)) return res.status(400).json({ error: 'ID invalide' });

    try {
        const result = await query(
            `SELECT id_reponse, soumission_id, question_id, choix_id, reponse_libre
             FROM reponse
             WHERE id_reponse = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Réponse non trouvée' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(`GET /reponse/${id} error :`, err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// -----------------------------
// Créer une réponse
// -----------------------------
router.post('/', async (req, res) => {
    const { soumission_id, question_id, choix_id = null, reponse_libre = null } = req.body;

    const sid = parseInt(soumission_id, 10);
    const qid = parseInt(question_id, 10);
    const cid = choix_id !== null ? parseInt(choix_id, 10) : null;

    if (!isPositiveInt(sid) || !isPositiveInt(qid)) {
        return res.status(400).json({
            error: 'soumission_id et question_id doivent être des entiers positifs'
        });
    }

    if (!cid && (!reponse_libre || reponse_libre.trim() === '')) {
        return res.status(400).json({
            error: 'Il faut soit un choix_id, soit une réponse libre'
        });
    }

    if (reponse_libre && reponse_libre.length > 500) {
        return res.status(400).json({
            error: 'La réponse libre ne peut pas dépasser 500 caractères'
        });
    }

    try {
        const result = await query(
            `INSERT INTO reponse (soumission_id, question_id, choix_id, reponse_libre)
             VALUES ($1, $2, $3, $4)
             RETURNING id_reponse, soumission_id, question_id, choix_id, reponse_libre`,
            [sid, qid, cid, reponse_libre ? reponse_libre.trim() : null]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('POST /reponse error :', err);

        if (err.code === '23503') {
            return res.status(400).json({
                error: 'soumission, question ou choix référencé inexistant'
            });
        }

        if (err.code === '23505') {
            return res.status(400).json({
                error: 'Cette réponse existe déjà pour cette soumission / question / choix'
            });
        }

        res.status(500).json({ error: 'Erreur serveur lors de la création de la réponse' });
    }
});

// -----------------------------
// Mettre à jour une réponse
// -----------------------------
router.put('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!isPositiveInt(id)) return res.status(400).json({ error: 'ID invalide' });

    try {
        const existing = await query('SELECT * FROM reponse WHERE id_reponse = $1', [id]);

        if (existing.rows.length === 0) {
            return res.status(404).json({ error: 'Réponse non trouvée' });
        }

        const current = existing.rows[0];

        const newSoumission = req.body.hasOwnProperty('soumission_id')
            ? parseInt(req.body.soumission_id, 10)
            : current.soumission_id;

        const newQuestion = req.body.hasOwnProperty('question_id')
            ? parseInt(req.body.question_id, 10)
            : current.question_id;

        const newChoix = req.body.hasOwnProperty('choix_id')
            ? (req.body.choix_id !== null ? parseInt(req.body.choix_id, 10) : null)
            : current.choix_id;

        const newLibre = req.body.hasOwnProperty('reponse_libre')
            ? (req.body.reponse_libre ? req.body.reponse_libre.trim() : null)
            : current.reponse_libre;

        if (!newChoix && (!newLibre || newLibre === '')) {
            return res.status(400).json({
                error: 'Il faut soit un choix_id, soit une réponse libre'
            });
        }

        const updated = await query(
            `UPDATE reponse
             SET soumission_id = $1, question_id = $2, choix_id = $3, reponse_libre = $4
             WHERE id_reponse = $5
             RETURNING id_reponse, soumission_id, question_id, choix_id, reponse_libre`,
            [newSoumission, newQuestion, newChoix, newLibre, id]
        );

        res.json(updated.rows[0]);
    } catch (err) {
        console.error(`PUT /reponse/${id} error :`, err);

        if (err.code === '23503') {
            return res.status(400).json({ error: 'Références invalides (FK)' });
        }

        if (err.code === '23505') {
            return res.status(400).json({ error: 'Doublon interdit par la contrainte UNIQUE' });
        }

        res.status(500).json({ error: 'Erreur serveur lors de la mise à jour de la réponse' });
    }
});

// -----------------------------
// Supprimer une réponse
// -----------------------------
router.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!isPositiveInt(id)) return res.status(400).json({ error: 'ID invalide' });

    try {
        const result = await query(
            'DELETE FROM reponse WHERE id_reponse = $1 RETURNING id_reponse',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Réponse non trouvée' });
        }

        res.json({
            message: 'Réponse supprimée',
            deletedId: result.rows[0].id_reponse
        });
    } catch (err) {
        console.error(`DELETE /reponse/${id} error :`, err);
        res.status(500).json({ error: 'Erreur serveur lors de la suppression' });
    }
});

module.exports = router;
