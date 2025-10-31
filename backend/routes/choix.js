const express = require('express');
const { query } = require('../db'); // On réutilise la connexion centrale
const router = express.Router();

// Helper de validation
const isPositiveInt = (v) => Number.isInteger(v) && v > 0;

// -----------------------------
// GET /api/choix
// → Liste tous les choix
// -----------------------------
router.get('/', async (req, res) => {
    try {
        const result = await query('SELECT id_choix, libelle, id_question FROM choix ORDER BY id_choix');
        res.json(result.rows);
    } catch (err) {
        console.error('GET /choix error :', err);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des choix' });
    }
});

// -----------------------------
// GET /api/choix/:id
// → Récupère un choix par son ID
// -----------------------------
router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!isPositiveInt(id)) return res.status(400).json({ error: 'ID invalide' });

    try {
        const result = await query('SELECT id_choix, libelle, id_question FROM choix WHERE id_choix = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Choix non trouvé' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(`GET /choix/${id} error :`, err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// -----------------------------
// POST /api/choix
// → Crée un nouveau choix
// -----------------------------
router.post('/', async (req, res) => {
    const { libelle, id_question } = req.body;

    if (typeof libelle !== 'string' || libelle.trim() === '' || libelle.length > 50) {
        return res.status(400).json({ error: 'Le champ "libelle" est requis (max 50 caractères)' });
    }
    const idQ = parseInt(id_question, 10);
    if (!isPositiveInt(idQ)) {
        return res.status(400).json({ error: 'Le champ "id_question" doit être un entier positif' });
    }

    try {
        const result = await query(
            `INSERT INTO choix (libelle, id_question)
             VALUES ($1, $2)
             RETURNING id_choix, libelle, id_question`,
            [libelle.trim(), idQ]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('POST /choix error :', err);
        if (err.code === '23503') {
            return res.status(400).json({ error: 'La question référencée est introuvable' });
        }
        res.status(500).json({ error: 'Erreur serveur lors de la création du choix' });
    }
});

// -----------------------------
// PUT /api/choix/:id
// → Met à jour un choix
// -----------------------------
router.put('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { libelle, id_question } = req.body;

    if (!isPositiveInt(id)) return res.status(400).json({ error: 'ID invalide' });

    const updates = [];
    const params = [];
    let i = 1;

    if (libelle !== undefined) {
        if (typeof libelle !== 'string' || libelle.trim() === '' || libelle.length > 50) {
            return res.status(400).json({ error: 'Le champ "libelle" doit être une chaîne non vide (max 50 caractères)' });
        }
        updates.push(`libelle = $${i++}`);
        params.push(libelle.trim());
    }

    if (id_question !== undefined) {
        const idQ = parseInt(id_question, 10);
        if (!isPositiveInt(idQ)) {
            return res.status(400).json({ error: 'Le champ "id_question" doit être un entier positif' });
        }
        updates.push(`id_question = $${i++}`);
        params.push(idQ);
    }

    if (updates.length === 0) {
        return res.status(400).json({ error: 'Aucun champ à mettre à jour' });
    }

    params.push(id);
    const sql = `UPDATE choix SET ${updates.join(', ')} WHERE id_choix = $${i} RETURNING id_choix, libelle, id_question`;

    try {
        const result = await query(sql, params);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Choix non trouvé' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(`PUT /choix/${id} error :`, err);
        if (err.code === '23503') {
            return res.status(400).json({ error: 'La question référencée est introuvable' });
        }
        res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du choix' });
    }
});

// -----------------------------
// DELETE /api/choix/:id
// → Supprime un choix
// -----------------------------
router.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!isPositiveInt(id)) return res.status(400).json({ error: 'ID invalide' });

    try {
        const result = await query('DELETE FROM choix WHERE id_choix = $1 RETURNING id_choix', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Choix non trouvé' });
        res.json({ message: 'Choix supprimé', deletedId: result.rows[0].id_choix });
    } catch (err) {
        console.error(`DELETE /choix/${id} error :`, err);
        res.status(500).json({ error: 'Erreur serveur lors de la suppression' });
    }
});

module.exports = router;
