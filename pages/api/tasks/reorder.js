import { reorderAllTasks } from '../../../lib/tasksService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Méthode ${req.method} non autorisée` });
  }

  const { order } = req.body;
  if (!Array.isArray(order)) {
    return res.status(400).json({ error: 'Ordre invalide' });
  }

  try {
    await reorderAllTasks(order);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erreur lors du réordonnancement des tâches:', error);
    res.status(500).json({ error: 'Erreur interne lors du réordonnancement' });
  }
}
