import { createClient } from './client';

export type InventoryRow = {
  id: string;
  name: string;
  unit: string;
  safetyStock: number;
  quantity: number;
};

async function requireClient() {
  const client = createClient();
  if (!client) throw new Error('Supabase 尚未設定');
  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error('請先登入');
  return client;
}

export async function createIngredient(input: { householdId: string; name: string; unit: string; quantity: number; safetyStock: number }) {
  const client = await requireClient();
  const { data, error } = await client.from('ingredients').insert({ household_id: input.householdId, name: input.name.trim(), unit: input.unit.trim(), safety_stock: Math.max(0, input.safetyStock) }).select('id').single();
  if (error) throw error;
  const { error: stockError } = await client.from('inventory').insert({ ingredient_id: data.id, quantity: Math.max(0, input.quantity) });
  if (stockError) { await client.from('ingredients').delete().eq('id', data.id); throw stockError; }
  return data.id as string;
}

export async function updateInventory(ingredientId: string, quantity: number) {
  const client = await requireClient();
  const { error } = await client.from('inventory').upsert({ ingredient_id: ingredientId, quantity: Math.max(0, quantity), updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function updateIngredient(ingredientId: string, values: { name?: string; unit?: string; safetyStock?: number }) {
  const client = await requireClient();
  const payload: Record<string, string | number> = {};
  if (values.name !== undefined) payload.name = values.name.trim();
  if (values.unit !== undefined) payload.unit = values.unit.trim();
  if (values.safetyStock !== undefined) payload.safety_stock = Math.max(0, values.safetyStock);
  const { error } = await client.from('ingredients').update(payload).eq('id', ingredientId);
  if (error) throw error;
}

export async function deleteIngredient(ingredientId: string) {
  const client = await requireClient();
  const { error } = await client.from('ingredients').delete().eq('id', ingredientId);
  if (error) throw error;
}
