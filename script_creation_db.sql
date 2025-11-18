DROP TABLE IF EXISTS reponse CASCADE;
DROP TABLE IF EXISTS choix CASCADE;
DROP TABLE IF EXISTS question CASCADE;
DROP TABLE IF EXISTS questionnaire CASCADE;
DROP TABLE IF EXISTS participant CASCADE;
DROP TABLE IF EXISTS categorie CASCADE;
DROP TABLE IF EXISTS administrateur CASCADE;

-- =========================================
-- SCRIPT SQL CREATION BASE DE DONNEES
-- =========================================

-- TABLE CATEGORIE
CREATE TABLE categorie (
    id_categorie SERIAL PRIMARY KEY,
    categorie VARCHAR(100) CHECK (categorie IN ('Patient', 'Soignant'))
);

-- TABLE PARTICIPANT
CREATE TABLE participant (
    id_participant VARCHAR(20) PRIMARY KEY,
    tranche_age VARCHAR(20) CHECK (
        tranche_age IN ('18-24', '25-34', '35-44', '45-54', '55-64', '+65')
    ),
    sexe VARCHAR(10) CHECK (sexe IN ('H', 'F', 'U')),
    anciennete_service INT CHECK (anciennete_service IS NULL OR anciennete_service >= 0),
    anciennete_fonction INT CHECK (anciennete_fonction IS NULL OR anciennete_fonction >= 0),
    date_creation DATE DEFAULT CURRENT_DATE,
    id_categorie INT REFERENCES categorie(id_categorie) ON DELETE SET NULL
);

-- TABLE QUESTIONNAIRE
CREATE TABLE questionnaire (
    id_questionnaire SERIAL PRIMARY KEY,
    id_participant VARCHAR(20) REFERENCES participant(id_participant) ON DELETE CASCADE,
    date_remplissage DATE DEFAULT CURRENT_DATE,
    type_questionnaire VARCHAR(50) CHECK (type_questionnaire IN ('Patient', 'Soignant')),
    nb_questions INT CHECK (nb_questions >= 0),
    nb_reponses INT CHECK (nb_reponses >= 0)
);

-- TABLE QUESTION
CREATE TABLE question (
    id_question SERIAL PRIMARY KEY,
    intitule TEXT NOT NULL,
    type_question VARCHAR(50) CHECK (type_question IN ('QCM', 'Texte')),
    id_questionnaire INT REFERENCES questionnaire(id_questionnaire) ON DELETE CASCADE
);

-- TABLE CHOIX
CREATE TABLE choix (
    id_choix SERIAL PRIMARY KEY,
    libelle VARCHAR(50),
    id_question INT REFERENCES question(id_question) ON DELETE NO ACTION
);

-- TABLE REPONSE
CREATE TABLE reponse (
    id_reponse SERIAL PRIMARY KEY,
    reponse_libre VARCHAR(150) NULL,
    id_question INT REFERENCES question(id_question) ON DELETE CASCADE,
    id_choix INT REFERENCES choix(id_choix) ON DELETE SET NULL,
    CONSTRAINT reponse_contenu CHECK (
        (id_choix IS NOT NULL) OR (reponse_libre IS NOT NULL)
    )
);

-- TABLE ADMINISTRATEUR
CREATE TABLE administrateur (
    id_admin SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL
);
