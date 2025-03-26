// Script de test pour JSONbin.io
// Exécutez avec: node test-jsonbin.js

require('dotenv').config({ path: '.env.local' }); // Charge les variables d'environnement depuis .env.local

const JSONBIN_API_URL = 'https://api.jsonbin.io/v3/b';
const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID;
const JSONBIN_MASTER_KEY = process.env.JSONBIN_MASTER_KEY;

const testData = {
  "Palier": [],
  "Cuisine/Séjour": [
    {
      "titre": "Test JSONbin.io",
      "statut": "À faire",
      "priorité": "Haute",
      "durée_estimée": 0.5
    }
  ],
  "Escalier": [],
  "Cuisine": []
};

async function testJsonbin() {
  console.log('Test de connexion à JSONbin.io...');
  console.log('BIN_ID:', JSONBIN_BIN_ID);
  console.log('MASTER_KEY:', JSONBIN_MASTER_KEY ? 'défini' : 'non défini');

  if (!JSONBIN_BIN_ID || !JSONBIN_MASTER_KEY) {
    console.error('Erreur: Variables d\'environnement manquantes');
    console.log('Veuillez vérifier votre fichier .env.local ou vos variables d\'environnement');
    return;
  }

  try {
    // Test de sauvegarde
    console.log('\n1. Test de sauvegarde des données...');
    const saveResponse = await fetch(`${JSONBIN_API_URL}/${JSONBIN_BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_MASTER_KEY
      },
      body: JSON.stringify(testData)
    });

    if (!saveResponse.ok) {
      throw new Error(`Erreur de sauvegarde: ${saveResponse.status} ${await saveResponse.text()}`);
    }

    const saveResult = await saveResponse.json();
    console.log('Sauvegarde réussie:', saveResult.metadata.id);

    // Test de chargement
    console.log('\n2. Test de chargement des données...');
    const loadResponse = await fetch(`${JSONBIN_API_URL}/${JSONBIN_BIN_ID}/latest`, {
      headers: {
        'X-Master-Key': JSONBIN_MASTER_KEY
      }
    });

    if (!loadResponse.ok) {
      throw new Error(`Erreur de chargement: ${loadResponse.status} ${await loadResponse.text()}`);
    }

    const loadResult = await loadResponse.json();
    console.log('Chargement réussi, données reçues:');
    console.log(JSON.stringify(loadResult.record, null, 2));

    console.log('\nTest terminé avec succès! Votre configuration JSONbin.io fonctionne correctement.');
  } catch (error) {
    console.error('\nErreur lors du test JSONbin.io:', error);
    console.log('\nVérifiez votre configuration et assurez-vous que:');
    console.log('1. Votre BIN_ID est correct');
    console.log('2. Votre MASTER_KEY est correct');
    console.log('3. Vous avez une connexion Internet active');
  }
}

testJsonbin(); 