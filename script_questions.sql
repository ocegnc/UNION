select * from question;

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
INSERT INTO question (intitule, type_question) VALUES ('L’odeur dans mon service est agréable.', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('L’ambiance olfactive contribue à une atmosphère apaisante.', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('J’ai perçu une amélioration du confort sensoriel global.', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('L’odeur est compatible avec l’activité clinique quotidienne.', 'Choix unique');
--ACCUEIL ET RELATIONS AVEC LES SOIGNANTS (PATIENT)
INSERT INTO question (intitule, type_question) VALUES ('Le personnel m’a accueilli chaleureusement.', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('Je me suis senti(e) écouté(e) et respecté(e).', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('Les explications fournies ont été claires.', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('Je me suis senti(e) en confiance tout au long de ma prise en charge.', 'Choix unique');

--EFFETS SUR LE BIEN-ÊTRE PROFESSIONNEL (SOIGNANT)
INSERT INTO question (intitule, type_question) VALUES ('Cette ambiance a réduit mon niveau de stress au travail.', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('Elle a amélioré mon humeur au cours de mes journées.', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('J’ai ressenti une diminution de la fatigue mentale.', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('Cela a eu un effet positif sur ma concentration.', 'Choix unique');
--CONFORT DE L'ENVIRONNEMENT (PATIENT)
INSERT INTO question (intitule, type_question) VALUES ('L’environnement général (lumière, bruit, propreté) était agréable.', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('Je me suis senti(e) détendu(e) dans cet environnement.', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('L’ambiance olfactive m’a paru agréable.', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('L’odeur a amélioré mon confort pendant les soins.', 'Choix unique');

--IMPACT SUR LA RELATION AVEC LES PATIENTS (SOIGNANT)
INSERT INTO question (intitule, type_question) VALUES ('Les patients semblent plus détendus dans l’environnement olfactif.', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('Cela a facilité mes échanges avec les patients.', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('L’ambiance olfactive a enrichi la qualité de la relation de soin.', 'Choix unique');
--EFFET RESSENTI (SENSORIEL/EMOTIONNEL) (PATIENT)
INSERT INTO question (intitule, type_question) VALUES ('L’odeur m’a aidé(e) à me sentir plus calme.', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('J’ai ressenti moins d’anxiété ou de tension grâce à l’ambiance.', 'Choix unique');
INSERT INTO question (intitule, type_question) VALUES ('Cette expérience m’a apporté un moment de bien-être.', 'Choix unique');

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

