const express = require('express');
const router = express.Router();
const { query } = require('../db'); //db.js

// types de tranche d'âge valides
const VALID_TRANCHES = ['18-24', '25-34', '35-44', '45-54', '55-64', '+65'];

// -----------------------------
// LISTER TOUS LES PARTICIPANTS
// -----------------------------
router.get('/', async (req, res) => {
    try {
        const result = await query('SELECT * FROM participant ORDER BY id_participant DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des participants" });
    }
});

// -----------------------------
// RÉCUPÈRER UN PARTICIPANT PAR ID
// -----------------------------
router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: "ID invalide" });

    try {
        const result = await query('SELECT * FROM participant WHERE id_participant = $1', [id]);
        if (!result.rows.length) return res.status(404).json({ error: "Participant non trouvé" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur lors de la récupération du participant" });
    }
});

// -----------------------------
// CRÉER UN NOUVEAU PARTICIPANT
// -----------------------------
router.post('/', async (req, res) => {
    const { tranche_age, sexe, anciennete, id_categorie } = req.body;

    // Validation basique
    if (!sexe) return res.status(400).json({ error: "Le champ 'sexe' est requis" });
    if (!['H', 'F', 'U'].includes(sexe)) {
        return res.status(400).json({ error: "Le champ 'sexe' doit être 'H', 'F' ou 'U'" });
    }
    if (!VALID_TRANCHES.includes(tranche_age)) {
        return res.status(400).json({ 
            error: `Le champ 'tranche_age' doit être une tranche valide (${VALID_TRANCHES.join(', ')})`
        });
    }
    if (anciennete !== undefined && (isNaN(anciennete) || anciennete < 0)) {
        return res.status(400).json({ error: "L'ancienneté doit être un entier positif ou nul" });
    }

    try {
        const result = await query(
            `INSERT INTO participant (tranche_age, sexe, anciennete, date_creation, id_categorie)
             VALUES ($1, $2, $3, CURRENT_DATE, $4)
             RETURNING id_participant, tranche_age, sexe, anciennete, date_creation, id_categorie`,
            [tranche_age, sexe, anciennete || null, id_categorie || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('POST /participant error:', err);
        res.status(500).json({ error: "Erreur serveur lors de la création du participant" });
    }
});


// -----------------------------
// METTRE À JOUR UN PARTICIPANT
// -----------------------------
router.put('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: "ID invalide" });

    const allowed = ['tranche_age', 'sexe', 'anciennete', 'id_categorie'];
    const updates = [];
    const values = [];

    allowed.forEach((key) => {
        if (req.body[key] !== undefined) {
            // Validation spécifique
            if (key === 'sexe' && !['H', 'F', 'U'].includes(req.body[key])) {
                return res.status(400).json({ error: "Le champ 'sexe' doit être 'H', 'F' ou 'U'" });
            }
            if (key === 'tranche_age' && !VALID_TRANCHES.includes(req.body[key])) {
                return res.status(400).json({
                    error: `Le champ 'age' doit être une tranche valide (${VALID_TRANCHES.join(', ')})`
                });
            }
            if (key === 'anciennete' && (isNaN(req.body[key]) || req.body[key] < 0)) {
                return res.status(400).json({ error: "L'ancienneté doit être positive" });
            }

            updates.push(`${key} = $${values.length + 1}`);
            values.push(req.body[key]);
        }
    });

    if (!updates.length) return res.status(400).json({ error: "Aucun champ à mettre à jour" });
    values.push(id);

    try {
        const sql = `UPDATE participant SET ${updates.join(', ')} WHERE id_participant = $${values.length} RETURNING *`;
        const result = await query(sql, values);
        if (result.rows.length === 0)
            return res.status(404).json({ error: "Participant non trouvé" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(`PUT /participant/${id} error:`, err);
        res.status(500).json({ error: "Erreur serveur lors de la mise à jour du participant" });
    }
});

// -----------------------------
// SUPPRIMER UN PARTICIPANT
// -----------------------------
router.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: "ID invalide" });

    try {
        const result = await query('DELETE FROM participant WHERE id_participant = $1 RETURNING id_participant', [id]);
        if (result.rows.length === 0)
            return res.status(404).json({ error: "Participant non trouvé" });
        res.json({ message: 'Participant supprimé', deletedId: result.rows[0].id_participant });
    } catch (err) {
        console.error(`DELETE /participant/${id} error:`, err);
        res.status(500).json({ error: "Erreur serveur lors de la suppression du participant" });
    }
});

module.exports = router;
