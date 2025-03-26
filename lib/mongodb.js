import { MongoClient } from 'mongodb';

// Configuration MongoDB à partir des variables d'environnement
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'planner_db';
const collectionName = process.env.MONGODB_COLLECTION || 'tasks';

if (!uri) {
  throw new Error('Veuillez définir la variable d\'environnement MONGODB_URI');
}

// Réutilisation de la connexion en développement
let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // En développement, utiliser une variable globale pour la connexion
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // En production, créer une nouvelle connexion
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

// Fonction pour obtenir la collection des tâches
export async function getTasksCollection() {
  const client = await clientPromise;
  const db = client.db(dbName);
  return db.collection(collectionName);
}

export default clientPromise; 