import { getAllTasks, addTask } from '../../../lib/tasksService';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const tasks = await getAllTasks();
        res.status(200).json(tasks);
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des tâches' });
      }
      break;
    
    case 'POST':
      try {
        const { zone, task } = req.body;
        if (!zone || !task || !task.titre) {
          return res.status(400).json({ error: 'Données invalides' });
        }
        
        const success = await addTask(zone, task);
        if (success) {
          res.status(201).json({ success: true, message: 'Tâche ajoutée avec succès' });
        } else {
          res.status(400).json({ error: 'Impossible d\'ajouter la tâche' });
        }
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l\'ajout de la tâche' });
      }
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Méthode ${method} non autorisée`);
  }
} 