# 📝 README 
## PTUT – Impact Olfactif dans la Relation de Soin

---

## 🌟 1. Présentation du Projet

Ce projet vise à évaluer l’impact de l’expérience **olfactive** dans la relation de soin, en étudiant ses effets sur le **bien-être des patients** ainsi que sur les **conditions de travail des soignants**.

L’application développée est une **interface web** permettant :

- la présentation de questionnaires,
- la saisie des réponses par les participants,
- l’enregistrement sécurisé des données dans une base de données dédiée.

---

## 💻 Pile Technique (Stack)

| Composant | Technologie | Rôle |
|---------|------------|------|
| **Frontend** | Vue.js (Vite) | Interface utilisateur, visualisation et soumission des questionnaires |
| **Backend** | Node.js + Express | API REST, logique métier, gestion des requêtes |
| **Base de données** | PostgreSQL 15 | Stockage structuré et sécurisé des données |
| **Déploiement local** | Docker & Docker Compose | Conteneurisation et automatisation de l’environnement |

---

## 🚀 2. Prérequis

L’installation du projet nécessite uniquement les outils suivants :

- **Git** – pour cloner le dépôt GitHub  
- **Docker Desktop** (ou Docker Engine sur Linux) – pour exécuter les conteneurs
- **PostgreSQL** – pour outils de gestion externe 

🔗 Lien officiel Docker :  
https://docs.docker.com/get-started/get-docker/

🔗 Lien officiel PostgreSQL :  
https://www.postgresql.org/download/ 

⚠️ Assurez-vous que **Docker est bien lancé** avant de continuer.

---

## 🛠️ 3. Installation et Démarrage Local (via Docker Compose)

L’ensemble de l’environnement (base de données, backend et frontend) est automatisé grâce à **Docker Compose**.

---

### 🔹 Étape 1 : Cloner le dépôt

Ouvrez un terminal (Bash, PowerShell ou équivalent) puis exécutez :

```bash
git clone https://github.com/ocegnc/UNION.git
cd UNION
```
Le projet contient 3 dossiers principaux :
- /backend	→	API Node.js + Express
- /frontend	→	Interface Vue.js + Vite
- /database	→	Scripts SQL de création des tables

Structure du projet : 
```bash
UNION/
 ├── backend/
 │     ├── routes/
 │     ├── .env
 │     ├── Dockerfile
 │     ├── db.js
 │     ├── index.js
 │     ├── package.json
 │     └── package-lock.json
 ├── frontend/
 │     ├── public/
 │     ├── src/
 │     ├── Dockerfile
 │     ├── nginx.conf
 │     ├── index.html
 │     ├── package.json
 │     ├── package-lock.json
 │     └── vite.config.ts
 ├── database/
 │     └── init.sql
 ├── docker-compose.yml
 └── README.md
```
---

### 🔹 Étape 2 : Vérification des fichiers de configuration

Le backend utilise un fichier `.env` pour se connecter à la base de données PostgreSQL.  
Ce fichier est **déjà fourni** dans l’arborescence du projet (backend/.env) et contient les paramètres nécessaires à la communication entre les conteneurs Docker :

#### Variables de configuration

| Variable | Valeur | Description |
|--------|-------|-------------|
| `DB_HOST` | `postgres` | Nom du service Docker PostgreSQL (indispensable pour la communication inter-conteneurs) |
| `DB_PORT` | `5432` | Port d’écoute par défaut du service PostgreSQL |
| `DB_USER` | `postgres` | Nom d’utilisateur de la base de données |
| `DB_PASSWORD` | `JLG@33choco` | Mot de passe de la base de données |
| `DB_DATABASE` | `DB_UNION_wellmotion` | Nom de la base de données |
| `PORT` | `3000` | Port interne du serveur Node.js / Express |

> 🔐 **Note de sécurité**  
> Pour une utilisation en production, il est fortement recommandé de **modifier le mot de passe** (`JLG@33choco`) :
> - dans le fichier `backend/.env`
> - et dans le fichier `docker-compose.yml`

---

### 🔹 Étape 3 : Lancement des services

À la **racine du projet** (là où se trouve le fichier `docker-compose.yml`), lancez l’ensemble des services en mode détaché (arrière-plan) :

```bash
docker compose up -d --build
```
Cette commande effectue les actions suivantes :
1. Construction des images Docker pour le backend et le frontend (basé sur leurs Dockerfile respectifs).
2. Téléchargement de l'image officielle postgres:15.
3. Lancement des trois conteneurs (postgres, backend, frontend).
4. Initialisation de la BDD : Le fichier ./database/init.sql sera exécuté automatiquement dans le conteneur postgres pour créer toutes les tables et insérer les données initiales (catégories, questions, choix).

---


### 🔹 Étape 4 : Vérification des Services

Vous pouvez vérifier que tous les services sont démarrés et en cours d'exécution avec la commande :
```bash
docker-compose ps
```
Le statut (State) de chaque service devrait être Up.

--- 

## 🌐 4. Accès à l'Application

Une fois que tous les conteneurs sont démarrés :

| Service | Port (Hôte) | URL d'Accès |
|--------|-------|-------------|
| **Interface Web (Frontend)** | `8081`| http://localhost:8081/ |
| **API Backend** | `3001`| http://localhost:3001/ |
| Base de Données (PostgreSQL) | `5432` | Accessible aux outils de gestion de BDD (ex: pgAdmin, DBeaver) |

Pour commencer à utiliser l'application, ouvrez votre navigateur et accédez à : http://localhost:8081/

---

## 🛑 5. Arrêt des Services

Pour arrêter et supprimer les conteneurs, ainsi que le réseau créé par Docker Compose (tout en préservant les données de la base de données grâce au volume postgres_data) :

```bash
docker-compose down
```

Pour arrêter, supprimer les conteneurs et toutes les données de la base de données (si vous voulez recommencer à zéro) :

```bash
docker-compose down -v
```

