require('dotenv').config(); //charge fichier .env au démarrage
const express = require('express');
const cors = require('cors');

//Import de la connexion à la base pour tester la connexion
const { query } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

//Test de la connexion à la base de données au démarrage
(async () => {
    try {
        const result = await query('SELECT NOW()');
        console.log('✅ Connexion PostgreSQL réussie -', result.rows[0].now);
    } catch (err) {
        console.error('❌ Erreur de connexion PostgreSQL :', err.message);
    }
})();


// Import route modules
const categoriesRoutes = require('./routes/categorie');
const participantsRoutes = require('./routes/participant');
const questionnairesRoutes = require('./routes/questionnaire');
const questionsRoutes = require('./routes/question');
const choixRoutes = require('./routes/choix');
const reponsesRoutes = require('./routes/reponse');
const soumissionsRoutes = require('./routes/soumission');
//question_questionaire
const QQRoutes = require('./routes/QQ');
//question_choix
const QCRoutes = require('./routes/QC');
//const administrateursRoutes = require('./routes/administrateur');

// Routes
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Serveur Express en marche' });
});
app.use('/api/categorie', categoriesRoutes);
app.use('/api/participant', participantsRoutes);
app.use('/api/questionnaire', questionnairesRoutes);
app.use('/api/question', questionsRoutes);
app.use('/api/choix', choixRoutes);
app.use('/api/reponse', reponsesRoutes);
app.use('/api/soumission', soumissionsRoutes);
app.use('/api/QQ', QQRoutes);
app.use('/api/QC', QCRoutes);
//app.use('/api/administrateur', administrateursRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('🔥 Erreur serveur :', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
    console.log('\n Endpoints disponibles :');
    console.log(`➡️  GET    http://localhost:${PORT}/api/categorie`);
    console.log(`➡️  GET    http://localhost:${PORT}/api/participant`);
    console.log(`➡️  GET    http://localhost:${PORT}/api/questionnaire`);
    console.log(`➡️  GET    http://localhost:${PORT}/api/question`);
    console.log(`➡️  GET    http://localhost:${PORT}/api/choix`);
    console.log(`➡️  GET    http://localhost:${PORT}/api/reponse`);
    console.log(`➡️  GET    http://localhost:${PORT}/api/soumission`);
    console.log(`➡️  GET    http://localhost:${PORT}/api/QQ`);
    console.log(`➡️  GET    http://localhost:${PORT}/api/QC`);
});

// Export app for testing
module.exports = app;