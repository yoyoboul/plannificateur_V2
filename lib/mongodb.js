import { MongoClient } from 'mongodb';

// Remplacez <db_password> par votre mot de passe dans le fichier .env.local
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'planner_db';
const collectionName = process.env.MONGODB_COLLECTION || 'tasks';

let client;
let clientPromise;

if (!uri) {
  throw new Error('Veuillez définir la variable d\'environnement MONGODB_URI');
}

if (process.env.NODE_ENV === 'development') {
  // En développement, on utilise une variable globale pour conserver la connexion
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // En production, on crée une nouvelle connexion
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