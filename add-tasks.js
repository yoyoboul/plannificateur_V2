// Script pour ajouter des tâches prédéfinies à MongoDB
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

// Structure de données des tâches à ajouter
const tasksData = {
  "Palier": [
    {
      "titre": "kkk",
      "statut": "À faire",
      "priorité": "Moyenne",
      "durée_estimée": 1.0
    }
  ],
  "Cuisine/Séjour": [
    {
      "titre": "Débarrasser / nettoyer",
      "statut": "À faire",
      "priorité": "Moyenne",
      "durée_estimée": 0.5,
      "date_début": "2025-03-26T08:14:44.667293",
      "date_fin": "2025-03-26T20:14:44.667293"
    },
    {
      "titre": "Bâcher",
      "statut": "À faire",
      "priorité": "Moyenne",
      "durée_estimée": 0.5,
      "date_début": "2025-03-26T08:14:44.667293",
      "date_fin": "2025-03-26T20:14:44.667293"
    },
    {
      "titre": "Terminer peinture",
      "statut": "À faire",
      "priorité": "Moyenne",
      "durée_estimée": 0.5,
      "date_début": "2025-03-27T08:14:44.667293",
      "date_fin": "2025-03-27T20:14:44.667293"
    },
    {
      "titre": "LM - Acheter nouvelles poignées",
      "statut": "À faire",
      "priorité": "Moyenne",
      "durée_estimée": 0.5,
      "date_début": "2025-03-28T08:14:44.667293",
      "date_fin": "2025-03-28T20:14:44.667293"
    },
    {
      "titre": "LM - Programmer échange PDT",
      "statut": "À faire",
      "priorité": "Moyenne",
      "durée_estimée": 0.5,
      "date_début": "2025-03-28T08:14:44.667293",
      "date_fin": "2025-03-28T20:14:44.667293"
    },
    {
      "titre": "LM - Voir reprise hotte",
      "statut": "À faire",
      "priorité": "Moyenne",
      "durée_estimée": 0.5,
      "date_début": "2025-03-28T08:17:02.629582",
      "date_fin": "2025-03-28T20:17:02.629582"
    },
    {
      "titre": "Programmer artisan cuisine",
      "statut": "À faire",
      "priorité": "Moyenne",
      "durée_estimée": 0.5,
      "date_début": "2025-03-28T08:17:02.629582",
      "date_fin": "2025-03-28T20:17:02.629582"
    },
    {
      "titre": "Finir murs",
      "statut": "À faire",
      "priorité": "Moyenne",
      "durée_estimée": 0.5,
      "date_début": "2025-03-29T08:17:02.629582",
      "date_fin": "2025-03-29T20:17:02.629582"
    },
    {
      "titre": "Fond dur et vitrification du parquet",
      "statut": "À faire",
      "priorité": "Moyenne",
      "durée_estimée": 0.5,
      "date_début": "2025-03-29T08:17:02.629582",
      "date_fin": "2025-03-29T20:17:02.629582"
    },
    {
      "titre": "Plinthes",
      "statut": "À faire",
      "priorité": "Moyenne",
      "durée_estimée": 0.5,
      "date_début": "2025-03-30T08:17:02.629582",
      "date_fin": "2025-03-30T20:17:02.629582"
    },
    {
      "titre": "Retirer blanc parquet",
      "statut": "À faire",
      "priorité": "Moyenne",
      "durée_estimée": 0.5,
      "date_début": "2025-03-25T08:14:44.667293",
      "date_fin": "2025-03-25T20:14:44.667293"
    }
  ],
  "Escalier": [],
  "Cuisine": []
};

async function addTasksToMongoDB() {
  // Récupérer l'URI MongoDB depuis les variables d'environnement
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'planner_db';
  const collectionName = process.env.MONGODB_COLLECTION || 'tasks';
  
  if (!uri) {
    console.error("MONGODB_URI n'est pas définie dans .env.local");
    return;
  }
  
  console.log("Connexion à MongoDB...");
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log("Connexion réussie!");
    
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    // Vérifier si le document 'travaux' existe déjà
    const existingDoc = await collection.findOne({ _id: 'travaux' });
    
    if (existingDoc) {
      console.log("Document 'travaux' trouvé. Mise à jour des tâches...");
      const result = await collection.updateOne(
        { _id: 'travaux' },
        { $set: { data: tasksData } }
      );
      
      if (result.acknowledged) {
        console.log("✅ Tâches mises à jour avec succès!");
      } else {
        console.error("❌ Erreur lors de la mise à jour des tâches");
      }
    } else {
      console.log("Document 'travaux' non trouvé. Création d'un nouveau document...");
      const result = await collection.insertOne({
        _id: 'travaux',
        data: tasksData
      });
      
      if (result.acknowledged) {
        console.log("✅ Tâches ajoutées avec succès!");
      } else {
        console.error("❌ Erreur lors de l'ajout des tâches");
      }
    }
    
    console.log("Vérification de l'état actuel des tâches:");
    const updatedDoc = await collection.findOne({ _id: 'travaux' });
    if (updatedDoc) {
      console.log("Structure des données en base:");
      console.log(`- Nombre de zones: ${Object.keys(updatedDoc.data).length}`);
      for (const zone in updatedDoc.data) {
        console.log(`- ${zone}: ${updatedDoc.data[zone].length} tâches`);
      }
    }
    
  } catch (error) {
    console.error("Erreur lors de la connexion à MongoDB:", error);
  } finally {
    await client.close();
    console.log("Connexion fermée");
  }
}

// Exécuter la fonction principale
addTasksToMongoDB().catch(console.error); 