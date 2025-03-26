// Script d'aide pour configurer JSONbin.io
// Exécutez avec: node setup-jsonbin.js

const fs = require('fs');
const readline = require('readline');
const https = require('https');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Structure de données initiale
const initialData = {
  "Palier": [],
  "Cuisine/Séjour": [],
  "Escalier": [],
  "Cuisine": []
};

// Fonction pour créer un fichier .env.local
function createEnvFile(binId, masterKey) {
  const envContent = `# Configuration JSONbin.io
JSONBIN_BIN_ID=${binId}
JSONBIN_MASTER_KEY=${masterKey}
`;

  fs.writeFileSync('.env.local', envContent);
  console.log('\nFichier .env.local créé avec succès!');
}

// Fonction pour vérifier si JSONbin.io est accessible
function checkJsonbinAccess() {
  return new Promise((resolve, reject) => {
    const req = https.request('https://api.jsonbin.io', { method: 'HEAD' }, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });
    
    req.on('error', (err) => {
      console.error('Erreur de connexion:', err.message);
      resolve(false);
    });
    
    req.end();
  });
}

// Fonction pour créer un nouveau bin sur JSONbin.io
function createBin(masterKey, name) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(initialData);
    
    const options = {
      hostname: 'api.jsonbin.io',
      port: 443,
      path: '/v3/b',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': masterKey,
        'X-Bin-Name': name,
        'X-Bin-Private': 'false',
        'Content-Length': data.length
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const result = JSON.parse(responseData);
            resolve(result.metadata.id);
          } catch (err) {
            reject(new Error('Erreur d\'analyse de la réponse: ' + err.message));
          }
        } else {
          reject(new Error(`Erreur HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });
    
    req.on('error', (err) => {
      reject(new Error('Erreur de requête: ' + err.message));
    });
    
    req.write(data);
    req.end();
  });
}

// Fonction principale
async function setupJsonbin() {
  console.log('\n=== Configuration de JSONbin.io pour le Planificateur de Travaux ===\n');
  
  // Vérifier l'accès à JSONbin.io
  console.log('Vérification de l\'accès à JSONbin.io...');
  const isAccessible = await checkJsonbinAccess();
  
  if (!isAccessible) {
    console.error('\nImpossible de se connecter à JSONbin.io. Vérifiez votre connexion Internet.');
    rl.close();
    return;
  }
  
  console.log('Connexion à JSONbin.io établie!');
  
  // Demander les informations
  console.log('\nVous avez deux options:');
  console.log('1. Créer un nouveau bin (recommandé pour une nouvelle installation)');
  console.log('2. Utiliser un bin existant (si vous avez déjà configuré JSONbin.io avant)');
  
  rl.question('\nChoisissez une option (1 ou 2): ', async (option) => {
    if (option === '1') {
      rl.question('\nEntrez votre clé Master Key de JSONbin.io: ', async (masterKey) => {
        rl.question('Entrez un nom pour votre bin (ex: planificateur-travaux): ', async (binName) => {
          try {
            console.log('\nCréation du bin...');
            const binId = await createBin(masterKey, binName);
            console.log(`Bin créé avec succès! ID: ${binId}`);
            
            createEnvFile(binId, masterKey);
            
            console.log('\nConfiguration terminée avec succès!');
            console.log('Pour tester votre configuration, exécutez: node test-jsonbin.js');
            rl.close();
          } catch (error) {
            console.error('\nErreur lors de la création du bin:', error.message);
            console.log('Assurez-vous que votre clé Master Key est correcte et réessayez.');
            rl.close();
          }
        });
      });
    } else if (option === '2') {
      rl.question('\nEntrez l\'ID de votre bin existant: ', (binId) => {
        rl.question('Entrez votre clé Master Key de JSONbin.io: ', (masterKey) => {
          createEnvFile(binId, masterKey);
          
          console.log('\nConfiguration terminée avec succès!');
          console.log('Pour tester votre configuration, exécutez: node test-jsonbin.js');
          rl.close();
        });
      });
    } else {
      console.log('\nOption non valide. Veuillez redémarrer le script et choisir 1 ou 2.');
      rl.close();
    }
  });
}

setupJsonbin(); 