import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem { productId:string; variantId?:string; name:string; imageUrl?:string; unitPrice:number; quantity:number; }
interface CartState { items:CartItem[]; addItem:(item:CartItem)=>void; removeItem:(productId:string,variantId?:string)=>void; setQuantity:(productId:string,quantity:number,variantId?:string)=>void; clear:()=>void; subtotal:()=>number; }
const key=(i:{productId:string;variantId?:string})=>`${i.productId}:${i.variantId??"default"}`;
export const useCartStore=create<CartState>()(persist((set,get)=>({items:[],addItem:item=>set(s=>{const k=key(item),i=s.items.findIndex(x=>key(x)===k);if(i<0)return{items:[...s.items,item]};const items=[...s.items];items[i]={...items[i],quantity:items[i].quantity+item.quantity};return{items};}),removeItem:(productId,variantId)=>set(s=>({items:s.items.filter(i=>key(i)!==key({productId,variantId}))})),setQuantity:(productId,quantity,variantId)=>set(s=>({items:quantity>0?s.items.map(i=>key(i)===key({productId,variantId})?{...i,quantity}:i):s.items.filter(i=>key(i)!==key({productId,variantId}))})),clear:()=>set({items:[]}),subtotal:()=>get().items.reduce((sum,i)=>sum+i.unitPrice*i.quantity,0)})),{name:"ramjanstore-cart",storage:createJSONStorage(()=>localStorage)}));
