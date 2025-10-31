const express = require('express');
const { query } = require('../db'); 
const router = express.Router();

// -----------------------------
// GET /questionnaires - Liste tous les questionnaires
// -----------------------------
router.get('/', async (req, res) => {
    try {
        const result = await query(
            'SELECT * FROM questionnaire ORDER BY id_questionnaire'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('GET /questionnaire error', err);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des questionnaires' });
    }
});

// -----------------------------
// GET /questionnaires/:id - Récupère un questionnaire
// -----------------------------
router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'ID invalide' });

    try {
        const result = await query(
            'SELECT * FROM questionnaire WHERE id_questionnaire = $1',
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
// POST /questionnaires - Crée un nouveau questionnaire
// -----------------------------
router.post('/', async (req, res) => {
    const { id_participant, date_remplissage = null, type, nb_questions = 0, nb_reponses = 0 } = req.body;

    if (!Number.isInteger(id_participant)) {
        return res.status(400).json({ error: "id_participant doit être un entier" });
    }

    if (!['Patient', 'Soignant'].includes(type)) {
        return res.status(400).json({ error: "type doit être 'Patient' ou 'Soignant'" });
    }

    if (nb_questions < 0 || nb_reponses < 0) {
        return res.status(400).json({ error: 'nb_questions et nb_reponses doivent être positifs' });
    }

    try {
        const result = await query(
            `INSERT INTO questionnaire (id_participant, date_remplissage, type, nb_questions, nb_reponses)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id_questionnaire, id_participant, date_remplissage, type, nb_questions, nb_reponses`,
            [id_participant, date_remplissage, type, nb_questions, nb_reponses]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('POST /questionnaire error', err);
        res.status(500).json({ error: 'Erreur serveur lors de la création du questionnaire' });
    }
});

// -----------------------------
// PUT /questionnaires/:id - Met à jour un questionnaire
// -----------------------------
router.put('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'ID invalide' });

    const allowed = ['id_participant', 'date_remplissage', 'type', 'nb_questions', 'nb_reponses'];
    const fields = [];
    const values = [];

    for (const key of allowed) {
        if (req.body[key] !== undefined) {
            if (key === 'type' && !['Patient', 'Soignant'].includes(req.body[key])) {
                return res.status(400).json({ error: "type doit être 'Patient' ou 'Soignant'" });
            }
            fields.push(`${key} = $${fields.length + 1}`);
            values.push(req.body[key]);
        }
    }

    if (!fields.length) return res.status(400).json({ error: 'Aucun champ valide à mettre à jour' });
    values.push(id);

    try {
        const sql = `UPDATE questionnaire SET ${fields.join(', ')} WHERE id_questionnaire = $${values.length} RETURNING *`;
        const result = await query(sql, values);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Questionnaire non trouvé' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(`PUT /questionnaire/${id} error`, err);
        res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du questionnaire' });
    }
});

// -----------------------------
// DELETE /questionnaires/:id - Supprime un questionnaire
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
