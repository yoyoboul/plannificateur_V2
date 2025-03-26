import { updateTask, deleteTask, updateTaskStatus, scheduleTask, unscheduleTask } from '../../../../lib/tasksService';

export default async function handler(req, res) {
  const { method } = req;
  const { zone, titre } = req.query;
  
  if (!zone || !titre) {
    return res.status(400).json({ error: 'Zone et titre requis' });
  }

  switch (method) {
    case 'PUT':
      try {
        const updatedTask = req.body;
        if (!updatedTask) {
          return res.status(400).json({ error: 'Données invalides' });
        }
        
        const success = await updateTask(zone, titre, updatedTask);
        if (success) {
          res.status(200).json({ success: true, message: 'Tâche mise à jour avec succès' });
        } else {
          res.status(404).json({ error: 'Tâche non trouvée' });
        }
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour de la tâche' });
      }
      break;
      
    case 'DELETE':
      try {
        const success = await deleteTask(zone, titre);
        if (success) {
          res.status(200).json({ success: true, message: 'Tâche supprimée avec succès' });
        } else {
          res.status(404).json({ error: 'Tâche non trouvée' });
        }
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression de la tâche' });
      }
      break;
      
    case 'PATCH':
      try {
        const { action, ...data } = req.body;
        
        if (action === 'updateStatus') {
          const { status } = data;
          const success = await updateTaskStatus(zone, titre, status);
          if (success) {
            res.status(200).json({ success: true, message: 'Statut mis à jour avec succès' });
          } else {
            res.status(404).json({ error: 'Tâche non trouvée' });
          }
        } 
        else if (action === 'schedule') {
          const { startDate, duration } = data;
          const success = await scheduleTask(zone, titre, startDate, duration);
          if (success) {
            res.status(200).json({ success: true, message: 'Tâche planifiée avec succès' });
          } else {
            res.status(404).json({ error: 'Tâche non trouvée' });
          }
        } 
        else if (action === 'unschedule') {
          const success = await unscheduleTask(zone, titre);
          if (success) {
            res.status(200).json({ success: true, message: 'Planification supprimée avec succès' });
          } else {
            res.status(404).json({ error: 'Tâche non trouvée' });
          }
        } 
        else {
          res.status(400).json({ error: 'Action non supportée' });
        }
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l\'opération' });
      }
      break;
      
    default:
      res.setHeader('Allow', ['PUT', 'DELETE', 'PATCH']);
      res.status(405).end(`Méthode ${method} non autorisée`);
  }
} 