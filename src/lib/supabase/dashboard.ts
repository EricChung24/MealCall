import {createClient} from './client';
import {Ingredient,InventoryItem,Meal} from '../../domain/types';

export async function loadDashboard(){
  const supabase=createClient(); if(!supabase)return null;
  const {data:{user}}=await supabase.auth.getUser(); if(!user)return null;
  let {data:member,error}=await supabase.from('household_members').select('household_id').eq('user_id',user.id).maybeSingle();
  if(error)return null;
  if(!member){
    const created=await supabase.from('households').insert({name:'鍾家冰箱'}).select('id').single();
    if(created.error||!created.data)return null;
    const joined=await supabase.from('household_members').insert({household_id:created.data.id,user_id:user.id,role_id:'admin',role_name:'管理員',permissions:['roles:manage','members:manage','inventory:edit','meal:create','meal:edit','meal:publish','meal:complete','inventory:view']}).select('household_id').single();
    if(joined.error||!joined.data)return null; member=joined.data;
  }
  const householdId=member.household_id;
  const [{data:ings},{data:mealRows}]=await Promise.all([
    supabase.from('ingredients').select('id,name,unit,safety_stock').eq('household_id',householdId),
    supabase.from('meals').select('id,date,slot,title,cook_id,status,meal_ingredients(ingredient_id,planned_amount,reserved_amount,consumed_amount)').eq('household_id',householdId).order('date')
  ]);
  const ingredients:Ingredient[]=(ings||[]).map(x=>({id:x.id,name:x.name,unit:x.unit,safetyStock:Number(x.safety_stock)}));
  const ids=ingredients.map(x=>x.id); const {data:inventoryRows}=ids.length?await supabase.from('inventory').select('ingredient_id,quantity').in('ingredient_id',ids):{data:[]};
  const inventory:InventoryItem[]=(inventoryRows||[]).map(x=>({ingredientId:x.ingredient_id,quantity:Number(x.quantity)}));
  const meals:Meal[]=(mealRows||[]).map(x=>({id:x.id,date:x.date,slot:x.slot,title:x.title,cookId:x.cook_id,status:x.status,ingredients:((x.meal_ingredients||[]) as Record<string,unknown>[]).map(m=>({ingredientId:m.ingredient_id as string,plannedAmount:Number(m.planned_amount),reservedAmount:Number(m.reserved_amount),consumedAmount:Number(m.consumed_amount)}))}));
  return {ingredients,inventory,meals,householdId};
}

export async function saveMeal(meal:Meal,householdId:string){const supabase=createClient();if(!supabase)throw new Error('Supabase 未設定');const {data:{user}}=await supabase.auth.getUser();if(!user)throw new Error('請先登入');const {data:row,error}=await supabase.from('meals').insert({household_id:householdId,date:meal.date,slot:meal.slot,title:meal.title,cook_id:user.id,status:meal.status}).select('id').single();if(error)throw error;const {error:itemError}=await supabase.from('meal_ingredients').insert(meal.ingredients.map(x=>({meal_id:row.id,ingredient_id:x.ingredientId,planned_amount:x.plannedAmount,reserved_amount:x.reservedAmount,consumed_amount:x.consumedAmount})));if(itemError)throw itemError;return row.id;}
export async function setMealStatus(id:string,status:Meal['status'],ingredients:Meal['ingredients']){const supabase=createClient();if(!supabase)throw new Error('Supabase 未設定');const {error}=await supabase.from('meals').update({status}).eq('id',id);if(error)throw error;const {error:itemError}=await supabase.from('meal_ingredients').upsert(ingredients.map(x=>({meal_id:id,ingredient_id:x.ingredientId,planned_amount:x.plannedAmount,reserved_amount:x.reservedAmount,consumed_amount:x.consumedAmount})));if(itemError)throw itemError;}
