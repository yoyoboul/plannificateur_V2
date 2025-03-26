import { getTasksCollection } from './mongodb';

// Structure vide pour les travaux
const EMPTY_TRAVAUX = {
  "Palier": [],
  "Cuisine/Séjour": [],
  "Escalier": [],
  "Cuisine": []
};

// Cache pour stocker les données en mémoire et réduire les appels à la base de données
let dataCache = null;
let lastCacheUpdate = null;
const CACHE_DURATION = 30000; // 30 secondes en millisecondes

// Initialiser la collection au premier démarrage
let isInitialized = false;
async function initializeCollection() {
  if (isInitialized) return;
  
  try {
    const collection = await getTasksCollection();
    
    // Vérifier si la collection contient déjà la structure de travaux
    const doc = await collection.findOne({ _id: 'travaux' });
    
    if (!doc) {
      // Si la collection est vide, initialiser avec la structure vide
      await collection.insertOne({ 
        _id: 'travaux',
        data: EMPTY_TRAVAUX
      });
      console.log('Collection MongoDB initialisée avec structure vide');
    }
    
    isInitialized = true;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la collection MongoDB:', error);
  }
}

// Charger les données de MongoDB
export async function loadTasks() {
  console.log('Chargement des données depuis MongoDB...');
  
  // Vérifier si le cache est encore valide
  const now = Date.now();
  if (dataCache && lastCacheUpdate && (now - lastCacheUpdate) < CACHE_DURATION) {
    console.log('Utilisation des données en cache');
    return dataCache;
  }
  
  try {
    // Initialiser la collection si nécessaire
    await initializeCollection();
    
    // Obtenir la collection
    const collection = await getTasksCollection();
    
    // Récupérer le document principal qui contient tous les travaux
    const doc = await collection.findOne({ _id: 'travaux' });
    
    if (!doc || !doc.data) {
      console.log('Aucune donnée trouvée, retour à la structure vide');
      return EMPTY_TRAVAUX;
    }
    
    console.log('Données chargées avec succès depuis MongoDB');
    
    // Mettre à jour le cache
    dataCache = doc.data;
    lastCacheUpdate = now;
    
    return doc.data;
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
    return EMPTY_TRAVAUX;
  }
}

// Sauvegarder les données dans MongoDB
export async function saveTasks(tasks) {
  console.log('Sauvegarde des tâches dans MongoDB...');
  try {
    // Vérifier que tasks est un objet valide
    if (!tasks || typeof tasks !== 'object') {
      console.error('saveTasks: tasks n\'est pas un objet valide', tasks);
      return false;
    }

    // Initialiser la collection si nécessaire
    await initializeCollection();
    
    // Obtenir la collection
    const collection = await getTasksCollection();
    
    // Convertir les objets Date en chaînes ISO pour JSON
    const tasksToSave = JSON.parse(JSON.stringify(tasks));
    
    // Mettre à jour le document principal avec les nouvelles données
    const result = await collection.updateOne(
      { _id: 'travaux' },
      { $set: { data: tasksToSave } },
      { upsert: true }
    );
    
    if (result.acknowledged) {
      console.log('Sauvegarde réussie dans MongoDB');
      
      // Mettre à jour le cache
      dataCache = tasksToSave;
      lastCacheUpdate = Date.now();
      
      return true;
    } else {
      console.error('Erreur lors de la sauvegarde dans MongoDB: opération non confirmée');
      return false;
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des données:', error);
    return false;
  }
}

// Obtenir toutes les tâches dans un format plat
export async function getAllTasks() {
  const tasks = await loadTasks();
  const allTasks = [];
  
  for (const zone in tasks) {
    if (tasks.hasOwnProperty(zone)) {
      tasks[zone].forEach(task => {
        allTasks.push({
          ...task,
          zone
        });
      });
    }
  }
  
  return allTasks;
}

// Obtenir les tâches d'une zone spécifique
export async function getTasksByZone(zone) {
  const tasks = await loadTasks();
  return tasks[zone] || [];
}

// Obtenir la liste des zones
export async function getZones() {
  const tasks = await loadTasks();
  return Object.keys(tasks);
}

// Ajouter une nouvelle tâche
export async function addTask(zone, task) {
  const tasks = await loadTasks();
  
  if (!tasks[zone]) {
    return false; // La zone n'existe pas
  }
  
  // Vérifier si une tâche avec le même titre existe déjà
  const taskExists = tasks[zone].some(t => t.titre === task.titre);
  if (taskExists) {
    return false;
  }
  
  tasks[zone].push(task);
  await saveTasks(tasks);
  return true;
}

// Mettre à jour une tâche existante
export async function updateTask(zone, titre, updatedTask) {
  const tasks = await loadTasks();
  
  if (!tasks[zone]) {
    return false; // La zone n'existe pas
  }
  
  const taskIndex = tasks[zone].findIndex(t => t.titre === titre);
  if (taskIndex === -1) {
    return false; // La tâche n'existe pas
  }
  
  tasks[zone][taskIndex] = {
    ...tasks[zone][taskIndex],
    ...updatedTask
  };
  
  await saveTasks(tasks);
  return true;
}

// Supprimer une tâche
export async function deleteTask(zone, titre) {
  const tasks = await loadTasks();
  
  if (!tasks[zone]) {
    return false; // La zone n'existe pas
  }
  
  const taskIndex = tasks[zone].findIndex(t => t.titre === titre);
  if (taskIndex === -1) {
    return false; // La tâche n'existe pas
  }
  
  tasks[zone].splice(taskIndex, 1);
  await saveTasks(tasks);
  return true;
}

// Obtenir le nombre de tâches par statut
export async function countTasksByStatus() {
  const allTasks = await getAllTasks();
  const counts = {};
  
  allTasks.forEach(task => {
    const status = task.statut;
    counts[status] = (counts[status] || 0) + 1;
  });
  
  return counts;
}

// Obtenir le nombre de tâches par zone
export async function countTasksByZone() {
  const tasks = await loadTasks();
  const counts = {};
  
  for (const zone in tasks) {
    if (tasks.hasOwnProperty(zone)) {
      counts[zone] = tasks[zone].length;
    }
  }
  
  return counts;
}

// Planifier une tâche (ajouter des dates de début et de fin)
export async function scheduleTask(zone, titre, startDate, duration) {
  const tasks = await loadTasks();
  
  if (!tasks[zone]) {
    return false;
  }
  
  const taskIndex = tasks[zone].findIndex(t => t.titre === titre);
  if (taskIndex === -1) {
    return false;
  }
  
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(start.getDate() + duration);
  
  tasks[zone][taskIndex] = {
    ...tasks[zone][taskIndex],
    date_début: start.toISOString(),
    date_fin: end.toISOString()
  };
  
  await saveTasks(tasks);
  return true;
}

// Annuler la planification d'une tâche
export async function unscheduleTask(zone, titre) {
  console.log('Fonction unscheduleTask appelée avec:', { zone, titre });
  try {
    const tasks = await loadTasks();
    console.log('Tâches chargées:', Object.keys(tasks));
    
    if (!tasks[zone]) {
      console.log('Zone non trouvée:', zone);
      return false;
    }
    
    const taskIndex = tasks[zone].findIndex(t => t.titre === titre);
    console.log('Index de la tâche:', taskIndex);
    
    if (taskIndex === -1) {
      console.log('Tâche non trouvée:', titre);
      return false;
    }
    
    console.log('Tâche avant déplanification:', tasks[zone][taskIndex]);
    
    // Vérifier si la tâche a des dates
    if (!tasks[zone][taskIndex].date_début && !tasks[zone][taskIndex].date_fin) {
      console.log('La tâche n\'est pas planifiée, rien à faire');
      return true;  // On considère que c'est un succès même si pas de modifications
    }
    
    // Supprimer les dates de la tâche
    const { date_début, date_fin, ...taskWithoutDates } = tasks[zone][taskIndex];
    tasks[zone][taskIndex] = taskWithoutDates;
    
    console.log('Tâche après déplanification:', tasks[zone][taskIndex]);
    
    // Sauvegarder les modifications
    const saveResult = await saveTasks(tasks);
    console.log('Résultat de la sauvegarde:', saveResult);
    
    return saveResult;
  } catch (error) {
    console.error('Erreur dans unscheduleTask:', error);
    throw error;  // Propager l'erreur pour meilleure visibilité
  }
}

// Obtenir toutes les tâches planifiées
export async function getScheduledTasks() {
  const allTasks = await getAllTasks();
  return allTasks.filter(task => task.date_début && task.date_fin);
}

// Mettre à jour le statut d'une tâche
export async function updateTaskStatus(zone, titre, newStatus) {
  return updateTask(zone, titre, { statut: newStatus });
}

// Ajouter une nouvelle zone
export async function addZone(zoneName) {
  const tasks = await loadTasks();
  
  if (tasks[zoneName]) {
    return false; // La zone existe déjà
  }
  
  tasks[zoneName] = [];
  await saveTasks(tasks);
  return true;
}

// Supprimer une zone et toutes ses tâches
export async function deleteZone(zoneName) {
  const tasks = await loadTasks();
  
  if (!tasks[zoneName]) {
    return false; // La zone n'existe pas
  }
  
  delete tasks[zoneName];
  await saveTasks(tasks);
  return true;
}

// Réinitialiser à la structure vide
export async function resetToEmpty() {
  await saveTasks(EMPTY_TRAVAUX);
  return true;
} 