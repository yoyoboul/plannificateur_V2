import { getTasksByZone, deleteZone } from '../../../lib/tasksService';

export default async function handler(req, res) {
  const { method } = req;
  const { zone } = req.query;
  
  if (!zone) {
    return res.status(400).json({ error: 'Zone requise' });
  }

  switch (method) {
    case 'GET':
      try {
        const tasks = await getTasksByZone(zone);
        res.status(200).json(tasks);
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des tâches de la zone' });
      }
      break;
      
    case 'DELETE':
      try {
        const success = await deleteZone(zone);
        if (success) {
          res.status(200).json({ success: true, message: 'Zone supprimée avec succès' });
        } else {
          res.status(404).json({ error: 'Zone non trouvée' });
        }
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression de la zone' });
      }
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'DELETE']);
      res.status(405).end(`Méthode ${method} non autorisée`);
  }
} 