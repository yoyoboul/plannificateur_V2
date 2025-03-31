// Test de connexion à MongoDB
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function testMongoConnection() {
  console.log('\n=== Test de connexion à MongoDB ===\n');
  
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'planner_db';
  const collectionName = process.env.MONGODB_COLLECTION || 'tasks';
  
  console.log(`URI configurée: ${uri ? 'Oui' : 'Non'}`);
  console.log(`Base de données: ${dbName}`);
  console.log(`Collection: ${collectionName}`);
  
  if (!uri) {
    console.error('\nErreur: Variable d\'environnement MONGODB_URI non définie');
    console.log('Veuillez configurer votre fichier .env.local avec MONGODB_URI');
    return;
  }
  
  try {
    console.log('\nCréation du client MongoDB...');
    const client = new MongoClient(uri);
    
    console.log('Connexion à MongoDB...');
    await client.connect();
    console.log('✅ Connexion réussie!');
    
    console.log(`\nAccès à la base de données '${dbName}'...`);
    const db = client.db(dbName);
    console.log('✅ Accès à la base de données réussi!');
    
    console.log(`\nRécupération des collections...`);
    const collections = await db.listCollections().toArray();
    console.log(`✅ ${collections.length} collection(s) trouvée(s):`);
    collections.forEach(collection => {
      console.log(`   - ${collection.name}`);
    });
    
    console.log(`\nRecherche de la collection '${collectionName}'...`);
    const targetCollection = collections.find(c => c.name === collectionName);
    
    if (targetCollection) {
      console.log(`✅ Collection '${collectionName}' trouvée!`);
      
      console.log(`\nComptage des documents...`);
      const count = await db.collection(collectionName).countDocuments();
      console.log(`✅ ${count} document(s) dans la collection`);
      
      if (count > 0) {
        console.log(`\nRécupération d'un exemple de document...`);
        const doc = await db.collection(collectionName).findOne();
        console.log('✅ Document récupéré:');
        console.log(JSON.stringify(doc, null, 2));
      }
    } else {
      console.log(`❌ Collection '${collectionName}' non trouvée`);
    }
    
    // Vérification spécifique pour les tâches
    if (collectionName === 'tasks') {
      console.log('\nVérification du document "travaux"...');
      const travauxDoc = await db.collection(collectionName).findOne({ _id: 'travaux' });
      
      if (travauxDoc) {
        console.log('✅ Document "travaux" trouvé!');
        console.log(`Structure des zones:`);
        Object.keys(travauxDoc.data).forEach(zone => {
          console.log(`   - ${zone}: ${travauxDoc.data[zone].length} tâche(s)`);
        });
      } else {
        console.log('❌ Document "travaux" non trouvé');
      }
    }
    
    console.log('\nFermeture de la connexion...');
    await client.close();
    console.log('✅ Connexion fermée');
    
    console.log('\n🎉 Test de connexion MongoDB terminé avec succès!');
  } catch (error) {
    console.error('\n❌ Erreur lors de la connexion à MongoDB:');
    console.error(error);
    
    console.log('\nSuggestions de résolution:');
    console.log('1. Vérifiez que votre chaîne de connexion (MONGODB_URI) est correcte');
    console.log('2. Assurez-vous que votre adresse IP est autorisée dans MongoDB Atlas (Network Access)');
    console.log('3. Vérifiez que vos identifiants sont corrects');
    console.log('4. Assurez-vous que la base de données et la collection existent');
  }
}

// Exécution du test
testMongoConnection().catch(error => {
  console.error('Erreur non gérée:', error);
}); 