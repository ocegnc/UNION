const express = require('express');
const { query } = require('../db'); 
const router = express.Router();

// types de question valides selon contrainte SQL
const VALID_TYPES = ['Choix unique', 'Choix multiples', 'Texte'];

// -----------------------------
// Récupérer toutes les questions
// -----------------------------
router.get('/', async (req, res) => {
    try {
        const result = await query('SELECT * FROM question ORDER BY id_question');
        res.json(result.rows);
    } catch (err) {
        console.error('GET /question error:', err);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des questions' });
    }
});

// -----------------------------
// Récupérer une question par son ID
// -----------------------------
router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'ID invalide' });

    try {
        const result = await query('SELECT * FROM question WHERE id_question = $1', [id]);
        if (result.rows.length === 0)
            return res.status(404).json({ error: 'Question non trouvée' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(`GET /question/${id} error:`, err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// -----------------------------
// Créer une nouvelle question
// -----------------------------
router.post('/', async (req, res) => {
    const { intitule, type_question } = req.body;

    if (!intitule || typeof intitule !== 'string') {
        return res.status(400).json({ error: 'Le champ "intitule" est requis et doit être une chaîne' });
    }
    if (!VALID_TYPES.includes(type_question)) {
        return res.status(400).json({
            error: `Le champ "type_question" doit être l'un de : ${VALID_TYPES.join(', ')}`
        });
    }

    try {
        const result = await query(
            `INSERT INTO question (intitule, type_question)
             VALUES ($1, $2)
             RETURNING *`,
            [intitule, type_question]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('POST /question error:', err);
        if (err.code === '23503'){
            return res.status(400).json({ error: 'Une question avec ce même intitulé existe déjà' });
        }
        res.status(500).json({ error: 'Erreur serveur lors de la création' });
    }
});

// -----------------------------
// Modifier une question
// -----------------------------
router.put('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { intitule, type_question } = req.body;

    if (Number.isNaN(id)) return res.status(400).json({ error: 'ID invalide' });

    const fields = [];
    const values = [];

    if (intitule !== undefined) {
        if (!intitule || typeof intitule !== 'string') {
            return res.status(400).json({ error: 'intitule doit être une chaîne non vide' });
        }
        fields.push(`intitule = $${fields.length + 1}`);
        values.push(intitule);
    }

    if (type_question !== undefined) {
        if (!VALID_TYPES.includes(type_question)) {
            return res.status(400).json({
                error: `type_question doit être l'un de : ${VALID_TYPES.join(', ')}`
            });
        }
        fields.push(`type_question = $${fields.length + 1}`);
        values.push(type_question);
    }

    if (fields.length === 0) {
        return res.status(400).json({ error: 'Aucun champ valide à mettre à jour' });
    }

    values.push(id);

    try {
        const result = await query(
            `UPDATE question
             SET ${fields.join(', ')}
             WHERE id_question = $${values.length}
             RETURNING *`,
            values
        );

        if (result.rows.length === 0)
            return res.status(404).json({ error: 'Question non trouvée' });

        res.json(result.rows[0]);
    } catch (err) {
        console.error(`PUT /question/${id} error:`, err);
        if (err.code === '23505')
            return res.status(400).json({ error: 'Une question avec cet intitulé existe déjà' });

        res.status(500).json({ error: 'Erreur serveur lors de la mise à jour' });
    }
});

// -----------------------------
// Supprimer une question
// -----------------------------
router.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'ID invalide' });

    try {
        const result = await query(
            'DELETE FROM question WHERE id_question = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0)
            return res.status(404).json({ error: 'Question non trouvée' });
        res.json({ message: 'Question supprimée', question: result.rows[0] });
    } catch (err) {
        console.error(`DELETE /question/${id} error:`, err);
        res.status(500).json({ error: 'Erreur serveur lors de la suppression' });
    }
});

module.exports = router;
































// // -----------------------------
// // Modifier une question
// // -----------------------------
// router.put('/:id', async (req, res) => {
//     const id = parseInt(req.params.id, 10);
//     const { intitule, type_question, id_questionnaire } = req.body;

//     if (Number.isNaN(id)) return res.status(400).json({ error: 'ID invalide' });
//     if (!intitule || typeof intitule !== 'string') {
//         return res.status(400).json({ error: 'Le champ "intitule" est requis et doit être une chaîne' });
//     }
//     if (!VALID_TYPES.includes(type_question)) {
//         return res.status(400).json({
//             error: `Le champ "type_question" doit être l'un de : ${VALID_TYPES.join(', ')}`
//         });
//     }
//     const qId = parseInt(id_questionnaire, 10);
//     if (Number.isNaN(qId)) {
//         return res.status(400).json({ error: 'Le champ "id_questionnaire" est requis et doit être un entier' });
//     }

//     try {
//         const result = await query(
//             `UPDATE question
//              SET intitule = $1, type_question = $2, id_questionnaire = $3
//              WHERE id_question = $4
//              RETURNING *`,
//             [intitule, type_question, qId, id]
//         );
//         if (result.rows.length === 0)
//             return res.status(404).json({ error: 'Question non trouvée' });
//         res.json(result.rows[0]);
//     } catch (err) {
//         console.error(`PUT /question/${id} error:`, err);
//         if (err.code === '23503')
//             return res.status(400).json({ error: 'Le questionnaire référencé est introuvable' });
//         res.status(500).json({ error: 'Erreur serveur lors de la mise à jour' });
//     }
// });
