import { db, Timestamp } from "../firebase/firestore.js";
import { ApiError } from "../utils/errors.js";

export const ORDER_FLOW=["NEW","CONFIRMED","PREPARING","READY_FOR_DELIVERY","OUT_FOR_DELIVERY","DELIVERED"] as const;
export type OrderStatus=typeof ORDER_FLOW[number];
const TERMINAL_STATUSES=new Set(["DELIVERED","CANCELLED","REFUNDED","RETURNED"]);

export async function listOrders(filters:{status?:string;paymentStatus?:string;from?:string;to?:string}) {
 let q:any=db.collection("orders").orderBy("createdAt","desc");
 if(filters.status) q=q.where("status","==",filters.status);
 if(filters.paymentStatus) q=q.where("paymentStatus","==",filters.paymentStatus);
 if(filters.from) { const d=new Date(filters.from); if(Number.isNaN(d.getTime())) throw new ApiError(400,"INVALID_DATE","Invalid from date"); q=q.where("createdAt",">=",Timestamp.fromDate(d)); }
 if(filters.to) { const d=new Date(filters.to); if(Number.isNaN(d.getTime())) throw new ApiError(400,"INVALID_DATE","Invalid to date"); q=q.where("createdAt","<=",Timestamp.fromDate(d)); }
 const s=await q.limit(100).get();
 return s.docs.map((d:any)=>({id:d.id,...d.data()}));
}

export async function transitionOrder(id:string,next:OrderStatus) {
 if(!ORDER_FLOW.includes(next)) throw new ApiError(400,"INVALID_STATUS","Invalid order status");
 const ref=db.collection("orders").doc(id);
 return db.runTransaction(async tx=>{
   const s=await tx.get(ref);
   if(!s.exists) throw new ApiError(404,"NOT_FOUND","Order not found");
   const data=s.data()!;
   const cur=String(data.status);
   if(TERMINAL_STATUSES.has(cur)) throw new ApiError(409,"TERMINAL_ORDER","Terminal orders cannot be changed");
   if(!ORDER_FLOW.includes(cur as OrderStatus)) throw new ApiError(409,"INVALID_CURRENT_STATUS","Order has an invalid lifecycle state");
   const currentIndex=ORDER_FLOW.indexOf(cur as OrderStatus);
   const nextIndex=ORDER_FLOW.indexOf(next);
   if(nextIndex!==currentIndex+1) throw new ApiError(409,"INVALID_TRANSITION",`Invalid transition ${cur} -> ${next}`);
   const now=Timestamp.now();
   const history=Array.isArray(data.statusHistory)?data.statusHistory:[];
   tx.update(ref,{status:next,updatedAt:now,statusHistory:[...history,{from:cur,to:next,at:now}]});
   return {id,status:next};
 });
}

export async function stats(){
 const now=new Date();
 const start=new Date(now.getFullYear(),now.getMonth(),now.getDate());
 const [orders,low,returns]=await Promise.all([
   db.collection("orders").where("createdAt",">=",Timestamp.fromDate(start)).get(),
   db.collection("products").where("isActive","==",true).where("stock","<=",5).get(),
   db.collection("return_requests").where("status","==","PENDING").get()
 ]);
 const revenue=orders.docs.reduce((n,d)=>n+(d.data().paymentStatus==="PAID"?Number(d.data().total):0),0);
 return {todayOrders:orders.size,revenue,lowStockAlerts:low.size,pendingReturns:returns.size};
}
