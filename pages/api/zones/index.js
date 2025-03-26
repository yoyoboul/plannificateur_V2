import { getZones, getTasksByZone, addZone } from '../../../lib/tasksService';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const zones = await getZones();
        res.status(200).json(zones);
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des zones' });
      }
      break;
    
    case 'POST':
      try {
        const { name } = req.body;
        if (!name) {
          return res.status(400).json({ error: 'Nom de zone requis' });
        }
        
        const success = await addZone(name);
        if (success) {
          res.status(201).json({ success: true, message: 'Zone ajoutée avec succès' });
        } else {
          res.status(400).json({ error: 'Impossible d\'ajouter la zone' });
        }
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l\'ajout de la zone' });
      }
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Méthode ${method} non autorisée`);
  }
} 