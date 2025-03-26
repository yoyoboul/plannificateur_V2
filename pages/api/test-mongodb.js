import { loadTasks, saveTasks, getAllTasks, addTask, updateTask, deleteTask } from '../../lib/tasksService';

export default async function handler(req, res) {
  try {
    const results = {};
    
    // Test 1: Chargement des tâches
    console.log('1. Test chargement de tâches...');
    const tasks = await loadTasks();
    results.loadTasks = { success: true, taskCount: Object.keys(tasks).length };
    
    // Test 2: Ajout d'une tâche
    console.log('2. Test ajout d\'une tâche...');
    const newTask = {
      titre: `Test MongoDB ${Date.now()}`,
      statut: 'À faire',
      priorité: 'Élevée',
      durée_estimée: 0.5
    };
    const addSuccess = await addTask('Cuisine', newTask);
    results.addTask = { success: addSuccess, task: newTask };
    
    // Test 3: Récupération de toutes les tâches
    console.log('3. Test récupération de toutes les tâches...');
    const allTasks = await getAllTasks();
    results.getAllTasks = { success: true, taskCount: allTasks.length };
    
    // Test 4: Mise à jour d'une tâche (si elle existe)
    if (addSuccess) {
      console.log('4. Test mise à jour d\'une tâche...');
      const updatedTask = { statut: 'En cours' };
      const updateSuccess = await updateTask('Cuisine', newTask.titre, updatedTask);
      results.updateTask = { success: updateSuccess };
    }
    
    // Test 5: Suppression de la tâche de test
    if (addSuccess) {
      console.log('5. Test suppression d\'une tâche...');
      const deleteSuccess = await deleteTask('Cuisine', newTask.titre);
      results.deleteTask = { success: deleteSuccess };
    }
    
    res.status(200).json({
      message: 'Tests MongoDB terminés avec succès',
      results,
      connectionStatus: 'OK'
    });
  } catch (error) {
    console.error('Erreur lors des tests MongoDB:', error);
    res.status(500).json({
      message: 'Erreur lors des tests MongoDB',
      error: error.message,
      connectionStatus: 'FAILED'
    });
  }
} 