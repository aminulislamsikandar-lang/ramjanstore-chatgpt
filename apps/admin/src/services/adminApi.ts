import { apiClient } from "../lib/apiClient";
export type Order={id:string;orderNumber?:string;status:string;total:number;paymentStatus:string;customer?:{name?:string;phone?:string};deliveryAddress?:Record<string,string>;items?:Array<{name:string;quantity:number;unitPrice:number}>};
export type ModerationItem={id:string;text?:string;stars?:number;productId?:string;userId?:string;createdAt?:string};
export const adminApi={
 stats:()=>apiClient<{data:{todayOrders:number;revenue:number;lowStockAlerts:number;pendingReturns:number}}>("/admin/stats"),
 orders:(q:string)=>apiClient<{data:Order[]}>(`/admin/orders${q}`),
 setStatus:(id:string,status:string)=>apiClient(`/admin/orders/${id}/status`,{method:"PATCH",body:JSON.stringify({status})}),
 moderation:()=>apiClient<{data:{comments:ModerationItem[];ratings:ModerationItem[]}}>("/admin/moderation"),
 moderate:(collection:"comments"|"ratings",id:string,isPublished:boolean)=>apiClient("/admin/moderation",{method:"PATCH",body:JSON.stringify({collection,id,isPublished})}),
};
