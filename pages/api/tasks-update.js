import { updateTask, deleteTask, updateTaskStatus, scheduleTask, unscheduleTask } from '../../lib/tasksService';

export default async function handler(req, res) {
  // Autoriser uniquement les méthodes POST pour simplifier
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Méthode ${req.method} non autorisée` });
  }
  
  try {
    const { zone, titre, action, ...data } = req.body;
    
    if (!zone || !titre) {
      return res.status(400).json({ error: 'Zone et titre requis' });
    }
    
    console.log('Requête de mise à jour:', { zone, titre, action, data });
    
    // Déterminer l'action à effectuer
    if (action === 'updateStatus') {
      const { status } = data;
      const success = await updateTaskStatus(zone, titre, status);
      if (success) {
        return res.status(200).json({ success: true, message: 'Statut mis à jour avec succès' });
      } else {
        return res.status(404).json({ error: 'Tâche non trouvée' });
      }
    } 
    else if (action === 'update') {
      const success = await updateTask(zone, titre, data);
      if (success) {
        return res.status(200).json({ success: true, message: 'Tâche mise à jour avec succès' });
      } else {
        return res.status(404).json({ error: 'Tâche non trouvée' });
      }
    }
    else if (action === 'schedule') {
      const { startDate, duration } = data;
      const success = await scheduleTask(zone, titre, startDate, duration);
      if (success) {
        return res.status(200).json({ success: true, message: 'Tâche planifiée avec succès' });
      } else {
        return res.status(404).json({ error: 'Tâche non trouvée' });
      }
    } 
    else if (action === 'unschedule') {
      console.log('Tentative de déplanification pour:', { zone, titre });
      try {
        const success = await unscheduleTask(zone, titre);
        console.log('Résultat de la déplanification:', success);
        if (success) {
          return res.status(200).json({ success: true, message: 'Planification supprimée avec succès' });
        } else {
          return res.status(404).json({ error: 'Tâche non trouvée' });
        }
      } catch (unscheduleError) {
        console.error('Erreur lors de la déplanification:', unscheduleError);
        return res.status(500).json({ error: `Erreur lors de la déplanification: ${unscheduleError.message}` });
      }
    } 
    else if (action === 'delete') {
      const success = await deleteTask(zone, titre);
      if (success) {
        return res.status(200).json({ success: true, message: 'Tâche supprimée avec succès' });
      } else {
        return res.status(404).json({ error: 'Tâche non trouvée' });
      }
    }
    else {
      return res.status(400).json({ error: 'Action non supportée' });
    }
  } catch (error) {
    console.error('Erreur dans l\'API tasks-update:', error);
    return res.status(500).json({ error: `Erreur lors de l'opération: ${error.message}` });
  }
} 