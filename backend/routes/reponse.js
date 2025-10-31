const express = require('express');
const { query } = require('../db'); 
const router = express.Router();

// Helper
const isPositiveInt = (v) => Number.isInteger(v) && v > 0;

// -----------------------------
// Récupèrer toutes les réponses
// -----------------------------
router.get('/', async (req, res) => {
    try {
        const result = await query('SELECT id_reponse, reponse_libre, id_question, id_choix FROM reponse ORDER BY id_reponse');
        res.json(result.rows);
    } catch (err) {
        console.error('GET /reponse error :', err);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des réponses' });
    }
});

// -----------------------------
// Récupèrer une réponse par ID
// -----------------------------
router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!isPositiveInt(id)) return res.status(400).json({ error: 'ID invalide' });

    try {
        const result = await query('SELECT id_reponse, reponse_libre, id_question, id_choix FROM reponse WHERE id_reponse = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Réponse non trouvée' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(`GET /reponse/${id} error :`, err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// -----------------------------
// Créer une nouvelle réponse
// -----------------------------
router.post('/', async (req, res) => {
    const { reponse_libre = null, id_question, id_choix = null } = req.body;

    const idQ = parseInt(id_question, 10);
    const idC = id_choix !== null ? parseInt(id_choix, 10) : null;

    if (!isPositiveInt(idQ)) {
        return res.status(400).json({ error: 'Le champ "id_question" est requis et doit être un entier positif' });
    }
    if ((reponse_libre === null || reponse_libre.trim() === '') && idC === null) {
        return res.status(400).json({ error: 'Au moins un des champs "reponse_libre" ou "id_choix" est requis' });
    }
    if (reponse_libre && reponse_libre.length > 150) {
        return res.status(400).json({ error: 'Le champ "reponse_libre" ne doit pas dépasser 150 caractères' });
    }

    try {
        const result = await query(
            `INSERT INTO reponse (reponse_libre, id_question, id_choix)
             VALUES ($1, $2, $3)
             RETURNING id_reponse, reponse_libre, id_question, id_choix`,
            [reponse_libre ? reponse_libre.trim() : null, idQ, idC]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('POST /reponse error :', err);
        if (err.code === '23503') {
            return res.status(400).json({ error: 'Question ou choix référencé inexistant' });
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

    const { reponse_libre, id_question, id_choix } = req.body;

    try {
        // Récupération de la réponse existante
        const existing = await query('SELECT * FROM reponse WHERE id_reponse = $1', [id]);
        if (existing.rows.length === 0) return res.status(404).json({ error: 'Réponse non trouvée' });

        const current = existing.rows[0];

        const newReponseLibre = req.body.hasOwnProperty('reponse_libre')
            ? (reponse_libre ? reponse_libre.trim() : null)
            : current.reponse_libre;

        const newIdQuestion = req.body.hasOwnProperty('id_question')
            ? parseInt(id_question, 10)
            : current.id_question;

        const newIdChoix = req.body.hasOwnProperty('id_choix')
            ? (id_choix !== null ? parseInt(id_choix, 10) : null)
            : current.id_choix;

        if ((newReponseLibre === null || newReponseLibre === '') && newIdChoix === null) {
            return res.status(400).json({ error: 'Au moins un des champs "reponse_libre" ou "id_choix" est requis' });
        }
        if (!isPositiveInt(newIdQuestion)) {
            return res.status(400).json({ error: 'Le champ "id_question" doit être un entier positif' });
        }

        const result = await query(
            `UPDATE reponse
             SET reponse_libre = $1, id_question = $2, id_choix = $3
             WHERE id_reponse = $4
             RETURNING id_reponse, reponse_libre, id_question, id_choix`,
            [newReponseLibre, newIdQuestion, newIdChoix, id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(`PUT /reponse/${id} error :`, err);
        if (err.code === '23503') {
            return res.status(400).json({ error: 'Question ou choix référencé inexistant' });
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
        const result = await query('DELETE FROM reponse WHERE id_reponse = $1 RETURNING id_reponse', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Réponse non trouvée' });
        res.json({ message: 'Réponse supprimée', deletedId: result.rows[0].id_reponse });
    } catch (err) {
        console.error(`DELETE /reponse/${id} error :`, err);
        res.status(500).json({ error: 'Erreur serveur lors de la suppression de la réponse' });
    }
});

module.exports = router;
