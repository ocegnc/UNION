--DROP TABLE IF EXISTS administrateur CASCADE;

--Valeurs catégorie
INSERT INTO categorie (categorie) VALUES ('Patient');
INSERT INTO categorie (categorie) VALUES ('Soignant');

-- Création participant
--INSERT INTO participant (tranche_age, sexe, categorie_id) VALUES ('18-24', 'H', 1);
--INSERT INTO participant (tranche_age, sexe, anciennete_service, anciennete_fonction, categorie_id) VALUES ('18-24', 'H', 3, 2, 2);

-- Valeurs questionnaire
INSERT INTO questionnaire (titre, categorie_id) VALUES ('Questionnaire patient', 1);
INSERT INTO questionnaire (titre, categorie_id) VALUES ('Questionnaire soignant', 2);

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

--Soumission 
--INSERT INTO soumission(participant_id) VALUES (1);
--INSERT INTO soumission(participant_id) VALUES (2);

--Réponses à un questionnaire patient
--INSERT INTO reponse(soumission_id, question_id, choix_id) VALUES (1, 8, 20);
--INSERT INTO reponse(soumission_id, question_id, reponse_libre) VALUES (2, 13, 'Femme de ménage');

-- SELECT TABLE
select * from categorie;
select * from participant;
select * from questionnaire;
select * from question;
select * from question_questionnaire;
select * from choix;
select * from question_choix;
select * from soumission;
select * from reponse;

 