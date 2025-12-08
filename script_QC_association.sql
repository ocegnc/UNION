select * from question_choix;

--CHOIX: Pas du tout d'accord
--CHOIX: Plutôt pas d''accord
--CHOIX: Plutôt d''accord
--CHOIX: Tout à fait d''accord
INSERT INTO question_choix (choix_id, question_id)
SELECT c, q
FROM generate_series(1, 4) AS c
CROSS JOIN generate_series(16, 37) AS q
ON CONFLICT DO NOTHING;
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (1, 40),
	(2, 40),
	(3, 40),
	(4, 40);

--CHOIX: Il me plaît beaucoup
--CHOIX: Il me plaît un peu
--CHOIX: Je ne peux pas dire qu''il me plaise ou me déplaise
--CHOIX: Il me déplaît un peu
--CHOIX: Il me déplaît beaucoup
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (5, 38),
	(6, 38),
	(7, 38),
	(8, 38),
	(9, 38);
--CHOIX: Je ne ressens aucun parfum
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (10, 38),
	(10, 39);
--CHOIX: Il est beaucoup trop fort
--CHOIX: Il est un peu trop fort
--CHOIX: Il est juste bien en terme d''intensité
--CHOIX: Il est un peu trop faible
--CHOIX: Il est beaucoup trop faible
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (11, 39),
	(12, 39),
	(13, 39),
	(14, 39),
	(15, 39);
	
--CHOIX: Pas du tout satisfait(e)
--CHOIX: Peu satisfait(e)
--CHOIX: Satisfait(e)
--CHOIX: Très satisfait(e)
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (16, 41),
	(17, 41),
	(18, 41),
	(19, 41);
	
--CHOIX: Oui
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (20, 8),
	(20, 42),
	(20, 43);
--CHOIX: Non
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (21, 8),
	(21, 42),
	(21, 43);
	
--CHOIX: Perte totale d''odorat
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (22, 9);
--CHOIX: Perte partielle d''odorat
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (23, 9);
--CHOIX: Perception déformée d''une odeur
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (24, 9);
--CHOIX: Présence d''odeurs dantômes
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (25, 9);
--CHOIX: Moins d''un mois
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (26, 10);
--CHOIX: Entre 1 et 3 mois
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (27, 10);
--CHOIX: Plus de 3 mois
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (28, 10);
--CHOIX: Je suis un(e) ancien(ne) fumeur(se)
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (29, 11);
--CHOIX: Oui, occasionnellement
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (30, 11);
--CHOIX: Oui, quotidiennement
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (31, 11);
--CHOIX: Oui, je vapote
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (32, 11);
--CHOIX: Médicale ou paramédicale
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (33, 12);
--CHOIX: Administrative
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (34, 12);
--CHOIX: Autres
INSERT INTO question_choix (choix_id, question_id)
VALUES 
    (35, 12);