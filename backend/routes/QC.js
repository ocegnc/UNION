const express = require('express');
const { query } = require('../db');
const router = express.Router();

// Helper
const isPositiveInt = (v) => Number.isInteger(v) && v > 0;

/* -----------------------------------------------------
   Récupérer toutes les associations question <-> choix
------------------------------------------------------ */
router.get('/', async (req, res) => {
    try {
        const result = await query(
            `SELECT choix_id, question_id 
             FROM question_choix 
             ORDER BY question_id, choix_id`
        );
        res.json(result.rows);
    } catch (err) {
        console.error('GET /qc error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/* -----------------------------------------------------
   Récupérer tous les choix d’une question
   /qc/question/:id
------------------------------------------------------ */
router.get('/question/:id', async (req, res) => {
    const questionId = parseInt(req.params.id, 10);
    if (!isPositiveInt(questionId)) {
        return res.status(400).json({ error: 'ID question invalide' });
    }

    try {
        const result = await query(
            `SELECT c.id_choix, c.libelle
             FROM choix c
             INNER JOIN question_choix qc ON qc.choix_id = c.id_choix
             WHERE qc.question_id = $1
             ORDER BY c.id_choix`,
            [questionId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(`GET /qc/question/${questionId} error:`, err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/* -----------------------------------------------------
   Récupérer toutes les questions utilisant un choix
   /qc/choix/:id
------------------------------------------------------ */
router.get('/choix/:id', async (req, res) => {
    const choixId = parseInt(req.params.id, 10);
    if (!isPositiveInt(choixId)) {
        return res.status(400).json({ error: 'ID choix invalide' });
    }

    try {
        const result = await query(
            `SELECT q.id_question, q.intitule
             FROM question q
             INNER JOIN question_choix qc ON qc.question_id = q.id_question
             WHERE qc.choix_id = $1
             ORDER BY q.id_question`,
            [choixId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(`GET /qc/choix/${choixId} error:`, err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/* -----------------------------------------------------
   Ajouter une association choix <-> question
------------------------------------------------------ */
router.post('/', async (req, res) => {
    const { choix_id, question_id } = req.body;

    if (!isPositiveInt(choix_id) || !isPositiveInt(question_id)) {
        return res.status(400).json({ error: 'choix_id et question_id doivent être des entiers positifs' });
    }

    try {
        const result = await query(
            `INSERT INTO question_choix (choix_id, question_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING
             RETURNING choix_id, question_id`,
            [choix_id, question_id]
        );

        if (result.rows.length === 0) {
            return res.status(200).json({
                message: "Association déjà existante (aucune modification)"
            });
        }

        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error('POST /qc error:', err);

        if (err.code === '23503') {
            return res.status(400).json({
                error: "La question ou le choix référencé n'existe pas"
            });
        }

        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/* -----------------------------------------------------
   Supprimer une association choix <-> question
------------------------------------------------------ */
router.delete('/', async (req, res) => {
    const { choix_id, question_id } = req.body;

    if (!isPositiveInt(choix_id) || !isPositiveInt(question_id)) {
        return res.status(400).json({ error: 'choix_id et question_id doivent être des entiers positifs' });
    }

    try {
        const result = await query(
            `DELETE FROM question_choix 
             WHERE choix_id = $1 AND question_id = $2
             RETURNING choix_id, question_id`,
            [choix_id, question_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Association non trouvée' });
        }

        res.json({
            message: 'Association supprimée',
            deleted: result.rows[0]
        });

    } catch (err) {
        console.error('DELETE /qc error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
