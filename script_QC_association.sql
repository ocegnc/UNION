select * from question_choix;

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