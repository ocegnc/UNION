--CREATE TABLES FOR QUESTIONNAIRE SYSTEM

-- Suppression des tables existantes (optionnel, pour un nettoyage facile)
DROP TABLE IF EXISTS reponse, choix, question_choix, soumission, question_questionnaire, question, questionnaire, participant, categorie CASCADE;

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

-- Fin de la création des tables

--TOUTES LES QUESTIONS
--INFORMATIONS PATIENT/SOIGNANT
INSERT INTO question (intitule, type_question) VALUES ('Avez-vous actuellement une perte olfactive ?', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('Si oui, précisez quel type de perte.', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('Depuis combien de temps estimez-vous être atteint de cette perte ?', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('Êtes-vous fumeur ?', 'Choix unique');
--INFORMATIONS SOIGNANT
INSERT INTO question (intitule, type_question) VALUES ('Quelle fonction exercez-vous ?', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('Si ‘Autres’, précisez :', 'Texte');
INSERT INTO question (intitule, type_question) VALUES ('Depuis combien de temps exercez-vous cette fonction en général ?', 'Texte');
INSERT INTO question (intitule, type_question) VALUES ('Depuis combien de temps exercez-vous dans le service d’oncologie de la clinique de l’Union ?', 'Texte');

--PERCEPTION DE L'AMBIANCE OLFACTIVE (SOIGNANT)
INSERT INTO question (intitule, type_question) VALUES ('L’ambiance olfactive dans mon service est agréable.', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('L’ambiance olfactive contribue à une atmosphère apaisante.', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('J’ai perçu une amélioration du confort sensoriel global.', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('L’ambiance olfactive est compatible avec l’activité clinique quotidienne.', 'Choix unique');
--ACCUEIL ET RELATIONS AVEC LES SOIGNANTS (PATIENT)
INSERT INTO question (intitule, type_question) VALUES ('Le personnel m’a accueilli chaleureusement.', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('Je me suis senti(e) écouté(e) et respecté(e).', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('Les explications fournies ont été claires.', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('Je me suis senti(e) en confiance tout au long de ma prise en charge.', 'Choix unique');

--EFFETS SUR LE BIEN-ÊTRE PROFESSIONNEL (SOIGNANT)
INSERT INTO question (intitule, type_question) VALUES ('L’ambiance olfactive a réduit mon niveau de stress au travail.', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('Elle a amélioré mon humeur au cours de mes journées.', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('J’ai ressenti une diminution de la fatigue mentale.', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('Cela a eu un effet positif sur ma concentration.', 'Choix unique');
--CONFORT DE L'ENVIRONNEMENT (PATIENT)
INSERT INTO question (intitule, type_question) VALUES ('L’environnement général (lumière, bruit, propreté) était agréable.', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('Je me suis senti(e) détendu(e) dans cet environnement.', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('L’ambiance olfactive m’a paru agréable.', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('L’ambiance olfactive a amélioré mon confort pendant les soins.', 'Choix unique');

--IMPACT SUR LA RELATION AVEC LES PATIENTS (SOIGNANT)
INSERT INTO question (intitule, type_question) VALUES ('Les patients semblent plus détendus dans l’environnement olfactif.', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('Cela a facilité mes échanges avec les patients.', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('L’ambiance olfactive a enrichi la qualité de la relation de soin.', 'Choix unique');
--EFFET RESSENTI (SENSORIEL/EMOTIONNEL) (PATIENT)
INSERT INTO question (intitule, type_question) VALUES ('L’ambiance olfactive m’a aidé(e) à me sentir plus calme', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('J’ai ressenti moins d’anxiété ou de tension grâce à l’ambiance olfactive.', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('L’ambiance olfactive m’a apporté un moment de bien-être.', 'Choix unique');

--APPRECIATION DE L'AMBIANCE OLFACTIVE (PATIENT/SOIGNANT)
INSERT INTO question (intitule, type_question) VALUES ('Quelle appréciation donneriez-vous à ce parfum ?', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('Quelle intensité donneriez-vous à ce parfum ?', 'Choix unique');
--APPRECIATION DEE L'AMBIANCE OLFACTIVE (SOIGNANT)
INSERT INTO question (intitule, type_question) VALUES ('Je souhaiterais que ce dispositif soit maintenu dans le temps.', 'Choix unique');

--EVALUATION GLOBALE (PATIENT/SOIGNANT)
INSERT INTO question (intitule, type_question) VALUES ('Êtes-vous globalement satisfait(e) de cette initiative ?', 'Choix unique');
--EVALUATION GLOBALE (PATIENT)
INSERT INTO question (intitule, type_question) VALUES ('Recommanderiez-vous ce service à un proche ?', 'Choix unique');
--EVALUATION GLOBALE (SOIGNANT)
INSERT INTO question (intitule, type_question) VALUES ('Recommanderiez-vous cette démarche dans d’autres services ?', 'Choix unique');

--REMARQUE LIBRE (PATIENT)
INSERT INTO question (intitule, type_question) VALUES ('Avez-vous des commentaires ou suggestions concernant votre prise en charge ou l’ambiance des lieux ?', 'Texte');
--REMARQUE LIBRE (SOIGNANT)
INSERT INTO question (intitule, type_question) VALUES ('Souhaitez-vous partager une remarque ou une suggestion à propos de cette ambiance olfactive au travail ?', 'Texte');

--Valeurs catégorie
INSERT INTO categorie (categorie) VALUES ('Patient');
INSERT INTO categorie (categorie) VALUES ('Soignant');

-- Valeurs questionnaire
INSERT INTO questionnaire (titre, categorie_id) VALUES ('Questionnaire patient', 1);
INSERT INTO questionnaire (titre, categorie_id) VALUES ('Questionnaire soignant', 2);

-- Tous les choix possibles
INSERT INTO choix(libelle) VALUES ('Pas du tout d''accord');
INSERT INTO choix(libelle) VALUES ('Plutôt pas d''accord');
INSERT INTO choix(libelle) VALUES ('Plutôt d''accord');
INSERT INTO choix(libelle) VALUES ('Tout à fait d''accord');
INSERT INTO choix(libelle) VALUES ('Il me plaît beaucoup');
INSERT INTO choix(libelle) VALUES ('Il me plaît un peu');
INSERT INTO choix(libelle) VALUES ('Je ne peux pas dire qu''il me plaise ou me déplaise');
INSERT INTO choix(libelle) VALUES ('Il me déplaît un peu');
INSERT INTO choix(libelle) VALUES ('Il me déplaît beaucoup');
INSERT INTO choix(libelle) VALUES ('Je ne ressens aucun parfum');
INSERT INTO choix(libelle) VALUES ('Il est beaucoup trop fort');
INSERT INTO choix(libelle) VALUES ('Il est un peu trop fort');
INSERT INTO choix(libelle) VALUES ('Il est juste bien en terme d''intensité');
INSERT INTO choix(libelle) VALUES ('Il est un peu trop faible');
INSERT INTO choix(libelle) VALUES ('Il est beaucoup trop faible');
INSERT INTO choix(libelle) VALUES ('Pas du tout satisfait(e)');
INSERT INTO choix(libelle) VALUES ('Peu satisfait(e)');
INSERT INTO choix(libelle) VALUES ('Satisfait(e)');
INSERT INTO choix(libelle) VALUES ('Très satisfait(e)');
INSERT INTO choix(libelle) VALUES ('Oui');
INSERT INTO choix(libelle) VALUES ('Non');
INSERT INTO choix(libelle) VALUES ('Perte totale d''odorat');
INSERT INTO choix(libelle) VALUES ('Perte partielle d''odorat');
INSERT INTO choix(libelle) VALUES ('Perception déformée d''une odeur');
INSERT INTO choix(libelle) VALUES ('Présence d''odeurs dantômes');
INSERT INTO choix(libelle) VALUES ('Moins d''un mois');
INSERT INTO choix(libelle) VALUES ('Entre 1 et 3 mois');
INSERT INTO choix(libelle) VALUES ('Plus de 3 mois');
INSERT INTO choix(libelle) VALUES ('Je suis un(e) ancien(ne) fumeur(se)');
INSERT INTO choix(libelle) VALUES ('Oui, occasionnellement');
INSERT INTO choix(libelle) VALUES ('Oui, quotidiennement');
INSERT INTO choix(libelle) VALUES ('Oui, je vapote');
INSERT INTO choix(libelle) VALUES ('Médicale ou paramédicale');
INSERT INTO choix(libelle) VALUES ('Administrative');
INSERT INTO choix(libelle) VALUES ('Autres');

-- Questions du questionnaire Patient
INSERT INTO question_questionnaire (questionnaire_id, question_id)
VALUES 
    (1, 1),
    (1, 2),
    (1, 3),
    (1, 4),
    (1, 13),
	(1, 14),
    (1, 15),
    (1, 16),
	(1, 21),
	(1, 22),
    (1, 23),
    (1, 24),
	(1, 28),
    (1, 29),
    (1, 30),
	(1, 31),
    (1, 32),
	(1, 34),
	(1, 35),
	(1, 37);

-- Questions du questionnaire Soignant
INSERT INTO question_questionnaire (questionnaire_id, question_id)
VALUES 
    (2, 1),
    (2, 2),
    (2, 3),
    (2, 4),
	(2, 5),
	(2, 6),
	(2, 7),
	(2, 8),
	(2, 9),
	(2, 10),
	(2, 11),
	(2, 12),
	(2, 17),
	(2, 18),
	(2, 19),
	(2, 20),
	(2, 25),
	(2, 26),
	(2, 27),
	(2, 31),
    (2, 32),
	(2, 33),
	(2, 34),
	(2, 36),
	(2, 38);

--CHOIX: Pas du tout d'accord
--CHOIX: Plutôt pas d''accord
--CHOIX: Plutôt d''accord
--CHOIX: Tout à fait d''accord
INSERT INTO question_choix (choix_id, question_id)
SELECT c, q
FROM generate_series(1, 4) AS c
CROSS JOIN generate_series(9, 30) AS q
ON CONFLICT DO NOTHING;
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (1, 33),
	(2, 33),
	(3, 33),
	(4, 33);

--CHOIX: Il me plaît beaucoup
--CHOIX: Il me plaît un peu
--CHOIX: Je ne peux pas dire qu''il me plaise ou me déplaise
--CHOIX: Il me déplaît un peu
--CHOIX: Il me déplaît beaucoup
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (5, 31),
	(6, 31),
	(7, 31),
	(8, 31),
	(9, 31);
--CHOIX: Je ne ressens aucun parfum
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (10, 31),
	(10, 32);
--CHOIX: Il est beaucoup trop fort
--CHOIX: Il est un peu trop fort
--CHOIX: Il est juste bien en terme d''intensité
--CHOIX: Il est un peu trop faible
--CHOIX: Il est beaucoup trop faible
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (11, 32),
	(12, 32),
	(13, 32),
	(14, 32),
	(15, 32);
	
--CHOIX: Pas du tout satisfait(e)
--CHOIX: Peu satisfait(e)
--CHOIX: Satisfait(e)
--CHOIX: Très satisfait(e)
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (16, 34),
	(17, 34),
	(18, 34),
	(19, 34);
	
--CHOIX: Oui
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (20, 1),
	(20, 35),
	(20, 36);
--CHOIX: Non
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (21, 1),
	(21, 35),
	(21, 36);
	
--CHOIX: Perte totale d''odorat
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (22, 2);
--CHOIX: Perte partielle d''odorat
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (23, 2);
--CHOIX: Perception déformée d''une odeur
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (24, 2);
--CHOIX: Présence d''odeurs dantômes
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (25, 2);
--CHOIX: Moins d''un mois
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (26, 3);
--CHOIX: Entre 1 et 3 mois
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (27, 3);
--CHOIX: Plus de 3 mois
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (28, 3);
--CHOIX: Je suis un(e) ancien(ne) fumeur(se)
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (29, 4);
--CHOIX: Oui, occasionnellement
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (30, 4);
--CHOIX: Oui, quotidiennement
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (31, 4);
--CHOIX: Oui, je vapote
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (32, 4);
--CHOIX: Médicale ou paramédicale
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (33, 5);
--CHOIX: Administrative
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (34, 5);
--CHOIX: Autres
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (35, 5);
