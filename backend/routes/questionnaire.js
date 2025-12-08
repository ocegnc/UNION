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
