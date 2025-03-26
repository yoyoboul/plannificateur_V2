import { MongoClient } from 'mongodb';

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

// Clé secrète pour sécuriser l'API (à configurer dans les variables d'environnement de Vercel)
// Utilisez la valeur suivante : planner2025
const API_SECRET = process.env.IMPORT_API_SECRET || 'planner2025';

export default async function handler(req, res) {
  // Vérifier la méthode HTTP (uniquement GET pour simplifier l'usage)
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }
  
  // Vérifier le mot de passe dans les paramètres de la requête
  const { secret } = req.query;
  if (!secret || secret !== API_SECRET) {
    return res.status(401).json({ 
      message: 'Non autorisé. Utilisez le paramètre secret dans l\'URL, par exemple: /api/import-tasks?secret=VOTRE_SECRET',
      success: false
    });
  }
  
  try {
    // Configuration MongoDB
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB || 'planner_db';
    const collectionName = process.env.MONGODB_COLLECTION || 'tasks';
    
    if (!uri) {
      return res.status(500).json({ 
        message: 'Variable d\'environnement MONGODB_URI non définie',
        success: false
      });
    }
    
    // Connexion à MongoDB
    const client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    // Vérifier si le document 'travaux' existe déjà
    const existingDoc = await collection.findOne({ _id: 'travaux' });
    
    let result;
    if (existingDoc) {
      // Mise à jour des tâches
      result = await collection.updateOne(
        { _id: 'travaux' },
        { $set: { data: tasksData } }
      );
      
      if (result.acknowledged) {
        await client.close();
        return res.status(200).json({
          message: 'Tâches mises à jour avec succès',
          success: true,
          stats: {
            zones: Object.keys(tasksData).length,
            tasks: Object.values(tasksData).reduce((sum, tasks) => sum + tasks.length, 0)
          }
        });
      }
    } else {
      // Création d'un nouveau document
      result = await collection.insertOne({
        _id: 'travaux',
        data: tasksData
      });
      
      if (result.acknowledged) {
        await client.close();
        return res.status(200).json({
          message: 'Tâches ajoutées avec succès',
          success: true,
          stats: {
            zones: Object.keys(tasksData).length,
            tasks: Object.values(tasksData).reduce((sum, tasks) => sum + tasks.length, 0)
          }
        });
      }
    }
    
    await client.close();
    return res.status(500).json({
      message: 'Opération non confirmée par MongoDB',
      success: false
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'importation des tâches:', error);
    return res.status(500).json({
      message: `Erreur lors de l'importation: ${error.message}`,
      success: false
    });
  }
} 