-- Suppression des tables existantes (optionnel, pour un nettoyage facile)
DROP TABLE IF EXISTS reponse, choix, question_choix, soumission, question_questionnaire, question, questionnaire, participant, categorie CASCADE;
--DROP TABLE IF EXISTS categorie;

--TABLE CATEGORIE (CATÉGORIE)
--Modélise les catégories de participants/questionnaires (e.g., Patient, Soignant)
CREATE TABLE categorie (
    id_categorie SERIAL PRIMARY KEY,
    categorie VARCHAR(100) NOT NULL UNIQUE
);

--
--TABLE PARTICIPANT (PARTICIPANT)
--Modélise les individus répondant aux questionnaires
CREATE TABLE participant (
    id_participant SERIAL PRIMARY KEY,
    categorie_id INT NOT NULL REFERENCES categorie(id_categorie) ON DELETE RESTRICT, -- FK vers CATEGORIE
    tranche_age VARCHAR(20) CHECK (
        tranche_age IN ('18-24', '25-34', '35-44', '45-54', '55-64', '+65')
    ),
    sexe VARCHAR(10) CHECK (sexe IN ('H', 'F', 'U')),
    anciennete_service INT CHECK (anciennete_service IS NULL OR anciennete_service >= 0),
    anciennete_fonction INT CHECK (anciennete_fonction IS NULL OR anciennete_fonction >= 0),
    date_creation DATE DEFAULT CURRENT_DATE
);

--
--TABLE QUESTIONNAIRE (QUESTIONNAIRE)
-- Modélise les différents types de questionnaires
CREATE TABLE questionnaire (
    id_questionnaire SERIAL PRIMARY KEY,
    categorie_id INT NOT NULL REFERENCES categorie(id_categorie) ON DELETE RESTRICT, -- FK vers CATEGORIE
	titre VARCHAR(50)
);

--
--TABLE QUESTION (QUESTION)
--Modélise les questions disponibles
--CREATE TYPE type_question_enum AS ENUM ('CM', 'libre'); -- Type utilisé dans le MCD
CREATE TABLE question (
    id_question SERIAL PRIMARY KEY,
    intitule VARCHAR(200) UNIQUE NOT NULL,
--    type_question type_question_enum NOT NULL, -- Utilise le type ENUM
    type_question VARCHAR(50) CHECK (type_question IN ('Choix multiples', 'Texte', 'Choix unique'))
);

--
--TABLE QUESTION_QUESTIONNAIRE (Association QUESTION - QUESTIONNAIRE)
-- Modélise la relation manyTOmany entre QUESTION et QUESTIONNAIRE
CREATE TABLE question_questionnaire (
    PRIMARY KEY (questionnaire_id, question_id),
	questionnaire_id INT REFERENCES questionnaire(id_questionnaire) ON DELETE CASCADE,
    question_id INT REFERENCES question(id_question) ON DELETE CASCADE
);

--
--TABLE CHOIX (CHOIX)
-- Modélise les options de réponse pour les questions à choix
CREATE TABLE choix (
    id_choix SERIAL PRIMARY KEY,
    libelle VARCHAR(50) NOT NULL
);

--
--TABLE QUESTION_CHOIX (Association QUESTION - CHOIX)
-- Modélise la relation manyTOmany entre QUESTION et CHOIX (une question peut avoir plusieurs choix, un choix peut être utilisé dans plusieurs questions)
CREATE TABLE question_choix (
    PRIMARY KEY (choix_id, question_id),
	choix_id INT REFERENCES choix(id_choix) ON DELETE CASCADE,
    question_id INT REFERENCES question(id_question) ON DELETE CASCADE
);

--
--TABLE SOUMISSION (SOUMISSION)
-- Modélise une instance où un participant a soumis un questionnaire
CREATE TABLE soumission (
    id_soumission SERIAL PRIMARY KEY,
    participant_id INT REFERENCES participant(id_participant) ON DELETE CASCADE, -- FK vers PARTICIPANT
    date_remplissage DATE DEFAULT CURRENT_DATE, -- Date/heure de la soumission
    UNIQUE (participant_id, date_remplissage)
);

--
--TABLE REPONSE (RÉPONSE)
-- Modélise les réponses spécifiques aux questions d'une soumission
CREATE TABLE reponse (
    id_reponse SERIAL PRIMARY KEY,
    soumission_id INT REFERENCES soumission(id_soumission) ON DELETE CASCADE, -- FK vers SOUMISSION
    question_id INT REFERENCES question(id_question) ON DELETE CASCADE, -- FK vers QUESTION
    choix_id INT REFERENCES choix(id_choix) ON DELETE SET NULL, -- Numéro du choix sélectionné (référence au champ num_choix de la table CHOIX)
    reponse_libre VARCHAR(500),
    -- La réponse doit contenir soit un choix (num_choix et intitule), soit une réponse libre
    CONSTRAINT reponse_contenu CHECK (
        (choix_id IS NOT NULL) OR (reponse_libre IS NOT NULL)
    ),
    -- Un participant ne peut répondre qu'une seule fois à une question spécifique dans le cadre d'une même soumission
    UNIQUE (soumission_id, question_id, choix_id)
);