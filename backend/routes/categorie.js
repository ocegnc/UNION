// const express = require('express');
// const { query } = require('../db'); 

// // /c:/Users/oce_g/VSCode/backend/routes/categorie.js
// const router = express.Router();

// // Récupérer toutes les catégories
// router.get('/', async (req, res) => {
//     try {
//         const result = await pool.query('SELECT id_categorie, categorie FROM CATEGORIE ORDER BY id_categorie');
//         res.json(result.rows);
//     } catch (err) {
//         console.error('GET /categorie error', err);
//         res.status(500).json({ error: 'Erreur serveur' });
//     }
// });

// // Récupérer une catégorie par id
// router.get('/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         const result = await pool.query('SELECT id_categorie, categorie FROM CATEGORIE WHERE id_categorie = $1', [id]);
//         if (result.rows.length === 0) return res.status(404).json({ error: 'Catégorie non trouvée' });
//         res.json(result.rows[0]);
//     } catch (err) {
//         console.error(`GET /categorie/${id} error`, err);
//         res.status(500).json({ error: 'Erreur serveur' });
//     }
// });

// // Créer une nouvelle catégorie
// router.post('/', async (req, res) => {
//     const { categorie } = req.body;
//     if (!categorie) return res.status(400).json({ error: 'Le champ "categorie" est requis' });

//     try {
//         const result = await pool.query(
//             'INSERT INTO CATEGORIE (categorie) VALUES ($1) RETURNING id_categorie, categorie',
//             [categorie]
//         );
//         res.status(201).json(result.rows[0]);
//     } catch (err) {
//         console.error('POST /categorie error', err);
//         res.status(500).json({ error: 'Erreur serveur' });
//     }
// });

// // Mettre à jour une catégorie
// router.put('/:id', async (req, res) => {
//     const { id } = req.params;
//     const { categorie } = req.body;
//     if (!categorie) return res.status(400).json({ error: 'Le champ "categorie" est requis' });

//     try {
//         const result = await pool.query(
//             'UPDATE CATEGORIE SET categorie = $1 WHERE id_categorie = $2 RETURNING id_categorie, categorie',
//             [categorie, id]
//         );
//         if (result.rows.length === 0) return res.status(404).json({ error: 'Catégorie non trouvée' });
//         res.json(result.rows[0]);
//     } catch (err) {
//         console.error(`PUT /categorie/${id} error`, err);
//         res.status(500).json({ error: 'Erreur serveur' });
//     }
// });

// // Supprimer une catégorie
// router.delete('/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         const result = await pool.query(
//             'DELETE FROM CATEGORIE WHERE id_categorie = $1 RETURNING id_categorie, categorie',
//             [id]
//         );
//         if (result.rows.length === 0) return res.status(404).json({ error: 'Catégorie non trouvée' });
//         res.json({ message: 'Catégorie supprimée', categorie: result.rows[0] });
//     } catch (err) {
//         console.error(`DELETE /categorie/${id} error`, err);
//         res.status(500).json({ error: 'Erreur serveur' });
//     }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const { query } = require('../db'); // utilisation directe de query

// -----------------------------
// GET /api/categorie
// → Récupérer toutes les catégories
// -----------------------------
router.get('/', async (req, res) => {
    try {
        const result = await query(
            'SELECT id_categorie, categorie FROM categorie ORDER BY id_categorie'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('GET /categorie error:', err);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des catégories' });
    }
});

// -----------------------------
// GET /api/categorie/:id
// → Récupérer une catégorie par ID
// -----------------------------
router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'ID invalide' });

    try {
        const result = await query(
            'SELECT id_categorie, categorie FROM categorie WHERE id_categorie = $1',
            [id]
        );
        if (result.rows.length === 0)
            return res.status(404).json({ error: 'Catégorie non trouvée' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(`GET /categorie/${id} error:`, err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// -----------------------------
// POST /api/categorie
// → Créer une nouvelle catégorie
// -----------------------------
router.post('/', async (req, res) => {
    const { categorie } = req.body;
    if (!categorie) return res.status(400).json({ error: 'Le champ "categorie" est requis' });

    // Validation métier (même contrainte que dans ta BDD)
    if (!['Patient', 'Soignant'].includes(categorie)) {
        return res
            .status(400)
            .json({ error: 'La catégorie doit être "Patient" ou "Soignant"' });
    }

    try {
        const result = await query(
            'INSERT INTO categorie (categorie) VALUES ($1) RETURNING id_categorie, categorie',
            [categorie]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('POST /categorie error:', err);
        res.status(500).json({ error: 'Erreur serveur lors de la création de la catégorie' });
    }
});

// -----------------------------
// PUT /api/categorie/:id
// → Mettre à jour une catégorie
// -----------------------------
router.put('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { categorie } = req.body;

    if (Number.isNaN(id)) return res.status(400).json({ error: 'ID invalide' });
    if (!categorie) return res.status(400).json({ error: 'Le champ "categorie" est requis' });
    if (!['Patient', 'Soignant'].includes(categorie)) {
        return res
            .status(400)
            .json({ error: 'La catégorie doit être "Patient" ou "Soignant"' });
    }

    try {
        const result = await query(
            'UPDATE categorie SET categorie = $1 WHERE id_categorie = $2 RETURNING id_categorie, categorie',
            [categorie, id]
        );
        if (result.rows.length === 0)
            return res.status(404).json({ error: 'Catégorie non trouvée' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(`PUT /categorie/${id} error:`, err);
        res.status(500).json({ error: 'Erreur serveur lors de la mise à jour' });
    }
});

// -----------------------------
// DELETE /api/categorie/:id
// → Supprimer une catégorie
// -----------------------------
router.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'ID invalide' });

    try {
        const result = await query(
            'DELETE FROM categorie WHERE id_categorie = $1 RETURNING id_categorie, categorie',
            [id]
        );
        if (result.rows.length === 0)
            return res.status(404).json({ error: 'Catégorie non trouvée' });
        res.json({ message: 'Catégorie supprimée', categorie: result.rows[0] });
    } catch (err) {
        console.error(`DELETE /categorie/${id} error:`, err);
        res.status(500).json({ error: 'Erreur serveur lors de la suppression' });
    }
});

module.exports = router;
