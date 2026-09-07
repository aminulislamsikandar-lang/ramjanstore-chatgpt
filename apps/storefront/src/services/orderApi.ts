import { apiClient } from "../lib/apiClient";
export type OrderStatus="NEW"|"CONFIRMED"|"PREPARING"|"READY_FOR_DELIVERY"|"OUT_FOR_DELIVERY"|"DELIVERED"|"CANCELLED";
export interface Order {id:string;orderNumber:string;status:OrderStatus;items:Array<{productId:string;name:string;quantity:number;unitPrice:number;subtotal:number}>;subtotal:number;deliveryCharge:number;discount:number;total:number;paymentMethod:"COD";paymentStatus:string;createdAt:string;deliveryAddress?:Record<string,string>;customerNotes?:string;}
export const orderApi={
 list:()=>apiClient<{data:Order[]}>('/orders'),
 get:(id:string)=>apiClient<{data:Order}|Order>(`/orders/${id}`),
 cancel:(id:string,reason:string)=>apiClient(`/orders/${id}/cancel`,{method:"POST",body:JSON.stringify({reason})}),
};
