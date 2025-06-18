import { getShoppingCollection } from './mongodb';

let cache = null;
let lastUpdate = null;
const CACHE_DURATION = 30000; // 30s

async function loadItems() {
  const now = Date.now();
  if (cache && lastUpdate && now - lastUpdate < CACHE_DURATION) {
    return cache;
  }
  const collection = await getShoppingCollection();
  const items = await collection.find().sort({ date: 1 }).toArray();
  cache = items;
  lastUpdate = now;
  return items;
}

export async function getAllItems() {
  return loadItems();
}

export async function addItem(item) {
  const collection = await getShoppingCollection();
  const result = await collection.insertOne(item);
  if (result.acknowledged) {
    cache = null;
    return true;
  }
  return false;
}

export async function deleteItem(id) {
  const collection = await getShoppingCollection();
  const { ObjectId } = await import('mongodb');
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount) {
    cache = null;
    return true;
  }
  return false;
}
