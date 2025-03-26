// Script d'aide pour configurer MongoDB Atlas
// Exécutez avec: node setup-mongodb.js

const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Fonction pour créer un fichier .env.local
function createEnvFile(uri, dbName, collectionName) {
  const envContent = `# Configuration MongoDB
MONGODB_URI=${uri}
MONGODB_DB=${dbName}
MONGODB_COLLECTION=${collectionName}
`;

  fs.writeFileSync('.env.local', envContent);
  console.log('\nFichier .env.local créé avec succès!');
}

// Fonction principale
async function setupMongoDB() {
  console.log('\n=== Configuration de MongoDB Atlas pour le Planificateur de Travaux ===\n');
  
  console.log('Ce script va vous aider à configurer la connexion à MongoDB Atlas.\n');
  console.log('Prérequis:');
  console.log('1. Avoir créé un compte MongoDB Atlas: https://www.mongodb.com/cloud/atlas/register');
  console.log('2. Avoir créé un cluster dans MongoDB Atlas');
  console.log('3. Avoir créé un utilisateur de base de données');
  console.log('4. Avoir configuré l\'accès réseau pour autoriser votre adresse IP');
  
  rl.question('\nEntrez votre chaîne de connexion MongoDB Atlas (mongodb+srv://...): ', (uri) => {
    // Vérifier si l'URI semble valide
    if (!uri.startsWith('mongodb+srv://') && !uri.startsWith('mongodb://')) {
      console.error('\nErreur: L\'URI MongoDB doit commencer par mongodb+srv:// ou mongodb://');
      rl.close();
      return;
    }
    
    // Vérifier si l'URI contient <password> ou <db_password> qui n'a pas été remplacé
    if (uri.includes('<password>') || uri.includes('<db_password>')) {
      console.error('\nAttention: Votre URI contient <password> ou <db_password>. Vous devez remplacer cela par votre mot de passe réel.');
      
      rl.question('\nVeuillez entrer votre mot de passe MongoDB: ', (password) => {
        // Remplacer <password> ou <db_password> par le mot de passe réel
        uri = uri.replace('<password>', password).replace('<db_password>', password);
        continueSetup(uri);
      });
    } else {
      continueSetup(uri);
    }
  });
  
  function continueSetup(uri) {
    rl.question('\nEntrez le nom de la base de données (défaut: planner_db): ', (dbName) => {
      // Utiliser la valeur par défaut si aucune valeur n'est fournie
      dbName = dbName.trim() || 'planner_db';
      
      rl.question('\nEntrez le nom de la collection (défaut: tasks): ', (collectionName) => {
        // Utiliser la valeur par défaut si aucune valeur n'est fournie
        collectionName = collectionName.trim() || 'tasks';
        
        // Créer le fichier .env.local
        createEnvFile(uri, dbName, collectionName);
        
        console.log('\nConfiguration terminée avec succès!');
        console.log('Pour tester votre configuration, exécutez: node test-mongodb.js');
        console.log('\nNote: N\'oubliez pas d\'installer les dépendances nécessaires:');
        console.log('npm install mongodb');
        
        rl.close();
      });
    });
  }
}

setupMongoDB(); 