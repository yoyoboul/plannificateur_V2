// Script de test pour MongoDB
// Exécutez avec: node test-mongodb.js

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'planner_db';
const collectionName = process.env.MONGODB_COLLECTION || 'tasks';

// Structure de données initiale
const initialData = {
  "Palier": [],
  "Cuisine/Séjour": [
    {
      "titre": "Test MongoDB",
      "statut": "À faire",
      "priorité": "Haute",
      "durée_estimée": 0.5
    }
  ],
  "Escalier": [],
  "Cuisine": []
};

async function testMongoDB() {
  console.log('\n=== Test de connexion à MongoDB ===\n');
  console.log('URI:', uri ? `${uri.substring(0, 20)}...` : 'Non définie');
  console.log('Base de données:', dbName);
  console.log('Collection:', collectionName);
  
  if (!uri) {
    console.error('\nErreur: La variable d\'environnement MONGODB_URI n\'est pas définie');
    console.log('Veuillez configurer votre fichier .env.local avec les informations de connexion MongoDB');
    return;
  }
  
  let client;
  try {
    // Se connecter à MongoDB
    console.log('\nConnexion à MongoDB...');
    client = new MongoClient(uri);
    await client.connect();
    console.log('Connexion réussie!');
    
    // Tester l'accès à la base de données
    console.log(`\nAccès à la base de données '${dbName}'...`);
    const db = client.db(dbName);
    console.log('Accès réussi!');
    
    // Tester l'accès à la collection
    console.log(`\nAccès à la collection '${collectionName}'...`);
    const collection = db.collection(collectionName);
    console.log('Accès réussi!');
    
    // Test d'écriture
    console.log('\n1. Test d\'écriture...');
    const writeResult = await collection.updateOne(
      { _id: 'test' },
      { $set: { data: initialData, timestamp: new Date() } },
      { upsert: true }
    );
    
    if (writeResult.acknowledged) {
      console.log('Écriture réussie!');
    } else {
      console.error('Erreur lors de l\'écriture');
    }
    
    // Test de lecture
    console.log('\n2. Test de lecture...');
    const document = await collection.findOne({ _id: 'test' });
    
    if (document) {
      console.log('Lecture réussie!');
      console.log('Document récupéré:');
      console.log(JSON.stringify(document, null, 2));
    } else {
      console.error('Aucun document trouvé');
    }
    
    // Test de suppression
    console.log('\n3. Test de suppression...');
    const deleteResult = await collection.deleteOne({ _id: 'test' });
    
    if (deleteResult.deletedCount === 1) {
      console.log('Suppression réussie!');
    } else {
      console.error('Erreur lors de la suppression');
    }
    
    console.log('\nTous les tests ont réussi! Votre connexion MongoDB est correctement configurée.');
  } catch (error) {
    console.error('\nErreur lors du test de connexion MongoDB:', error);
    console.log('\nVérifiez les points suivants:');
    console.log('1. Votre chaîne de connexion est correcte et contient le bon mot de passe');
    console.log('2. Votre adresse IP est autorisée dans les paramètres de sécurité de MongoDB Atlas');
    console.log('3. Votre réseau permet les connexions sortantes vers MongoDB Atlas');
  } finally {
    if (client) {
      console.log('\nFermeture de la connexion...');
      await client.close();
    }
  }
}

testMongoDB().catch(console.error); 