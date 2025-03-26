import { countTasksByStatus, countTasksByZone } from '../../../lib/tasksService';

export default async function handler(req, res) {
  const { method } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Méthode ${method} non autorisée`);
  }

  try {
    const statusCounts = await countTasksByStatus();
    const zoneCounts = await countTasksByZone();
    
    res.status(200).json({
      status: statusCounts,
      zones: zoneCounts
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
} 