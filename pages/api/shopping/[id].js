import { deleteItem } from '../../../lib/shoppingService';

export default async function handler(req, res) {
  const { method, query: { id } } = req;
  if (method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).end();
  }
  try {
    const success = await deleteItem(id);
    if (success) return res.status(200).json({ success: true });
    res.status(404).json({ error: 'Article non trouvé' });
  } catch {
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
}
