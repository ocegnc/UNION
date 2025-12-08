const express = require('express');
const { query } = require('../db');
const router = express.Router();

// Helper
const isPositiveInt = (v) => Number.isInteger(v) && v > 0;

// -----------------------------
// Lister tous les choix
// -----------------------------
router.get('/', async (req, res) => {
    try {
        const result = await query(
            'SELECT id_choix, libelle FROM choix ORDER BY id_choix'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('GET /choix error :', err);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des choix' });
    }
});

// -----------------------------
// Récupérer un choix par son ID
// -----------------------------
router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!isPositiveInt(id)) return res.status(400).json({ error: 'ID invalide' });

    try {
        const result = await query(
            'SELECT id_choix, libelle FROM choix WHERE id_choix = $1',
            [id]
        );
        if (result.rows.length === 0)
            return res.status(404).json({ error: 'Choix non trouvé' });

        res.json(result.rows[0]);
    } catch (err) {
        console.error(`GET /choix/${id} error :`, err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// -----------------------------
// Créer un nouveau choix
// -----------------------------
router.post('/', async (req, res) => {
    const { libelle } = req.body;

    if (typeof libelle !== 'string' || libelle.trim() === '' || libelle.length > 50) {
        return res.status(400).json({ error: 'Le champ "libelle" est requis (max 50 caractères)' });
    }

    try {
        const result = await query(
            `INSERT INTO choix (libelle)
             VALUES ($1)
             RETURNING id_choix, libelle`,
            [libelle.trim()]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('POST /choix error :', err);
        res.status(500).json({ error: 'Erreur serveur lors de la création du choix' });
    }
});

// -----------------------------
// Mettre à jour un choix
// -----------------------------
router.put('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { libelle } = req.body;

    if (!isPositiveInt(id)) return res.status(400).json({ error: 'ID invalide' });

    if (libelle === undefined) {
        return res.status(400).json({ error: 'Aucun champ à mettre à jour' });
    }

    if (typeof libelle !== 'string' || libelle.trim() === '' || libelle.length > 50) {
        return res.status(400).json({
            error: 'Le champ "libelle" doit être une chaîne non vide (max 50 caractères)'
        });
    }

    try {
        const result = await query(
            `UPDATE choix
             SET libelle = $1
             WHERE id_choix = $2
             RETURNING id_choix, libelle`,
            [libelle.trim(), id]
        );

        if (result.rows.length === 0)
            return res.status(404).json({ error: 'Choix non trouvé' });

        res.json(result.rows[0]);
    } catch (err) {
        console.error(`PUT /choix/${id} error :`, err);
        res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du choix' });
    }
});

// -----------------------------
// Supprimer un choix
// -----------------------------
router.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!isPositiveInt(id)) return res.status(400).json({ error: 'ID invalide' });

    try {
        const result = await query(
            'DELETE FROM choix WHERE id_choix = $1 RETURNING id_choix',
            [id]
        );

        if (result.rows.length === 0)
            return res.status(404).json({ error: 'Choix non trouvé' });

        res.json({ message: 'Choix supprimé', deletedId: result.rows[0].id_choix });
    } catch (err) {
        console.error(`DELETE /choix/${id} error :`, err);
        res.status(500).json({ error: 'Erreur serveur lors de la suppression' });
    }
});

module.exports = router;
