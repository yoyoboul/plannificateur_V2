# Planificateur de Travaux de Rénovation

Une application moderne et interactive pour visualiser, organiser et planifier des travaux de rénovation d'appartement.

## Fonctionnalités

- Tableau de bord interactif avec visualisation de l'avancement
- Gestion des tâches par zone
- Planification des travaux via un agenda
- Rapport détaillé avec graphiques
- Interface utilisateur moderne et réactive

## Technologies utilisées

- **Frontend**: React, Next.js, Material UI, Recharts
- **API**: API Routes de Next.js
- **Stockage**: Fichier JSON (persistance des données sans base de données)
- **Animations**: Framer Motion

## Installation

1. Cloner ce dépôt
2. Installer les dépendances:
```bash
npm install
```
3. Lancer l'application en mode développement:
```bash
npm run dev
```
4. Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur

## Structure du projet

```
├── components/          # Composants React réutilisables
├── lib/                 # Logique métier et service de données
├── pages/               # Pages de l'application et API Routes
│   ├── api/             # API pour la gestion des données
│   └── ...              # Pages de l'application
├── public/              # Fichiers statiques
├── styles/              # Styles CSS globaux
└── tasks_data.json      # Stockage des données
```

## Déploiement

Pour créer une version optimisée pour la production :

```bash
npm run build
npm start
```

## Migration depuis la version précédente

Cette application est une refonte moderne de l'ancienne version basée sur Streamlit. Les principales améliorations sont :

- Interface utilisateur plus moderne et réactive
- Meilleures performances grâce au rendu côté client
- Animation et transitions fluides
- Expérience utilisateur améliorée sur mobile
- Structure de code plus maintenable

Les données sont conservées dans le même format JSON que l'ancienne version.

## Configuration du stockage de données avec MongoDB Atlas

Cette application utilise [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) comme base de données pour stocker les données de tâches. Cela permet à l'application de fonctionner correctement dans des environnements serverless comme Vercel ou Netlify.

### Étapes de configuration

1. **Créer un compte MongoDB Atlas**
   - Rendez-vous sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) et créez un compte gratuit
   - Créez un nouveau cluster (l'option gratuite M0 est suffisante)

2. **Configurer votre cluster**
   - Créez un utilisateur de base de données avec un mot de passe sécurisé
   - Configurez l'accès réseau pour autoriser les connexions depuis votre adresse IP
   - Si vous prévoyez de déployer sur Vercel, vous devrez également autoriser les connexions depuis n'importe où (0.0.0.0/0)

3. **Obtenir votre chaîne de connexion**
   - Cliquez sur "Connect" sur votre cluster
   - Choisissez "Connect your application"
   - Copiez la chaîne de connexion qui ressemble à: `mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - Remplacez `<password>` par le mot de passe de votre utilisateur de base de données

4. **Configurer les variables d'environnement**
   - Créez un fichier `.env.local` à la racine du projet avec les variables suivantes:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     MONGODB_DB=planner_db
     MONGODB_COLLECTION=tasks
     ```
   - Si vous déployez sur Vercel ou Netlify, ajoutez ces variables dans les paramètres d'environnement du projet

### Outils de configuration

L'application fournit des scripts pour faciliter la configuration de MongoDB:

1. **Assistant de configuration**
   ```bash
   npm install  # Installez d'abord les dépendances
   node setup-mongodb.js
   ```
   Ce script interactif vous guidera à travers le processus de configuration de MongoDB Atlas.

2. **Test de connexion**
   ```bash
   node test-mongodb.js
   ```
   Ce script vérifie que votre connexion MongoDB est correctement configurée en effectuant des tests de lecture, écriture et suppression.

### Remarques importantes

- Les données sont mises en cache côté serveur pendant 30 secondes pour améliorer les performances
- La structure des données est maintenue dans un document unique avec l'ID 'travaux'
- Le niveau gratuit de MongoDB Atlas offre 512 Mo de stockage, ce qui est largement suffisant pour cette application

Si vous avez des problèmes avec MongoDB Atlas, veuillez consulter leur [documentation officielle](https://docs.atlas.mongodb.com/) ou ouvrir une issue sur ce dépôt. 