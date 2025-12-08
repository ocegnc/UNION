const express = require('express');
const { query } = require('../db');
const router = express.Router();

// -----------------------------------------------
// Récupérer toutes les associations (optionnel)
// -----------------------------------------------
router.get('/', async (req, res) => {
    try {
        const result = await query(`
            SELECT questionnaire_id, question_id
            FROM question_questionnaire
            ORDER BY questionnaire_id, question_id
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('GET /qq error:', err);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des associations' });
    }
});

// -----------------------------------------------
// Récupérer toutes les questions d’un questionnaire
// -----------------------------------------------
router.get('/questionnaire/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'ID questionnaire invalide' });

    try {
        const result = await query(
            `SELECT q.*
             FROM question_questionnaire qq
             JOIN question q ON q.id_question = qq.question_id
             WHERE qq.questionnaire_id = $1
             ORDER BY q.id_question`,
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(`GET /qq/questionnaire/${id} error:`, err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ------------------------------------------------------
// Récupérer tous les questionnaires contenant une question
// ------------------------------------------------------
router.get('/question/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'ID question invalide' });

    try {
        const result = await query(
            `SELECT qu.*
             FROM question_questionnaire qq
             JOIN questionnaire qu ON qu.id_questionnaire = qq.questionnaire_id
             WHERE qq.question_id = $1
             ORDER BY qu.id_questionnaire`,
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(`GET /qq/question/${id} error:`, err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// -----------------------------------------------
// Ajouter une association QUESTION - QUESTIONNAIRE
// -----------------------------------------------
router.post('/', async (req, res) => {
    const { questionnaire_id, question_id } = req.body;

    if (!Number.isInteger(questionnaire_id) || !Number.isInteger(question_id)) {
        return res.status(400).json({
            error: 'questionnaire_id et question_id doivent être des entiers'
        });
    }

    try {
        const result = await query(
            `INSERT INTO question_questionnaire (questionnaire_id, question_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING
             RETURNING questionnaire_id, question_id`,
            [questionnaire_id, question_id]
        );

        // Si le lien existait déjà
        if (result.rows.length === 0) {
            return res.status(200).json({
                message: 'Association déjà existante',
                questionnaire_id,
                question_id
            });
        }

        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error('POST /qq error:', err);

        if (err.code === '23503') {
            return res.status(400).json({
                error: 'La question ou le questionnaire référencé est introuvable'
            });
        }

        res.status(500).json({ error: 'Erreur serveur lors de la création du lien' });
    }
});

// -----------------------------------------------
// Supprimer une association
// -----------------------------------------------
router.delete('/', async (req, res) => {
    const { questionnaire_id, question_id } = req.body;

    if (!Number.isInteger(questionnaire_id) || !Number.isInteger(question_id)) {
        return res.status(400).json({
            error: 'questionnaire_id et question_id doivent être des entiers'
        });
    }

    try {
        const result = await query(
            `DELETE FROM question_questionnaire
             WHERE questionnaire_id = $1 AND question_id = $2
             RETURNING questionnaire_id, question_id`,
            [questionnaire_id, question_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Association non trouvée' });
        }

        res.json({
            message: 'Association supprimée',
            deleted: result.rows[0]
        });
    } catch (err) {
        console.error('DELETE /qq error:', err);
        res.status(500).json({ error: 'Erreur serveur lors de la suppression' });
    }
});

module.exports = router;
