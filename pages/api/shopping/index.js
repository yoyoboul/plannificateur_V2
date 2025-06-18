import { getAllItems, addItem } from '../../../lib/shoppingService';

export default async function handler(req, res) {
  const { method } = req;
  if (method === 'GET') {
    try {
      const items = await getAllItems();
      res.status(200).json(items);
    } catch {
      res.status(500).json({ error: 'Erreur lors de la récupération des articles' });
    }
  } else if (method === 'POST') {
    try {
      const item = req.body;
      if (!item || !item.produit) {
        return res.status(400).json({ error: 'Données invalides' });
      }
      item.date = item.date || new Date().toISOString();
      const success = await addItem(item);
      if (success) return res.status(201).json({ success: true });
      res.status(400).json({ error: "Impossible d'ajouter" });
    } catch (e) {
      res.status(500).json({ error: 'Erreur lors de l\'ajout' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end();
  }
}
