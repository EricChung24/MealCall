export type MealSlot='早餐'|'午餐'|'晚餐'; export type MealStatus='草稿'|'已發布'|'已完成'|'已取消';
export type Ingredient={id:string;name:string;unit:string;safetyStock:number}; export type InventoryItem={ingredientId:string;quantity:number};
export type MealIngredient={ingredientId:string;plannedAmount:number;reservedAmount:number;consumedAmount:number};
export type Meal={id:string;date:string;slot:MealSlot;title:string;cookId:string;status:MealStatus;ingredients:MealIngredient[]};
export type Permission='meal:create'|'meal:edit'|'meal:publish'|'meal:complete'|'inventory:view'|'inventory:edit'|'members:manage'|'roles:manage';
export type Member={id:string;name:string;roleId:string;roleName:string;permissions:Permission[]};
