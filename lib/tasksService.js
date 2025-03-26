import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

// Convertir les fonctions fs en Promises
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

// Chemin vers le fichier JSON
const DATA_FILE = path.join(process.cwd(), 'tasks_data.json');

// Structure vide pour les travaux
const EMPTY_TRAVAUX = {
  "Palier": [],
  "Cuisine/Séjour": [],
  "Escalier": [],
  "Cuisine": []
};

// Charger les données du fichier JSON
export async function loadTasks() {
  try {
    const fileExists = fs.existsSync(DATA_FILE);
    if (!fileExists) {
      // Créer le fichier s'il n'existe pas
      await saveTasks(EMPTY_TRAVAUX);
      return EMPTY_TRAVAUX;
    }
    
    const data = await readFileAsync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
    return EMPTY_TRAVAUX;
  }
}

// Sauvegarder les données dans le fichier JSON
export async function saveTasks(tasks) {
  try {
    // Convertir les objets Date en chaînes ISO pour JSON
    const tasksToSave = JSON.parse(JSON.stringify(tasks));
    
    await writeFileAsync(DATA_FILE, JSON.stringify(tasksToSave, null, 2), 'utf8');
    return true;
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
  const tasks = await loadTasks();
  
  if (!tasks[zone]) {
    return false;
  }
  
  const taskIndex = tasks[zone].findIndex(t => t.titre === titre);
  if (taskIndex === -1) {
    return false;
  }
  
  const { date_début, date_fin, ...taskWithoutDates } = tasks[zone][taskIndex];
  tasks[zone][taskIndex] = taskWithoutDates;
  
  await saveTasks(tasks);
  return true;
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