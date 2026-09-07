import type { Response } from "express";
import { db, Timestamp } from "../firebase/firestore.js";
import { getDeliveryZoneByPostalCode } from "../services/deliveryZone.service.js";
import { validateCoupon } from "../services/coupon.service.js";
import type { AuthenticatedRequest } from "../middleware/authenticate.js";

interface CheckoutItem { productId:string; variantId?:string; quantity:number; }
interface CheckoutBody { items:CheckoutItem[]; addressId:string; couponCode?:string; }

export async function processCheckout(req:AuthenticatedRequest,res:Response):Promise<void>{
 const userId=req.user!.uid; const body=req.body as CheckoutBody;
 if(!Array.isArray(body.items)||!body.items.length||!body.addressId) { res.status(400).json({message:"Items and addressId are required"}); return; }
 if(body.items.some(i=>!i.productId||!Number.isInteger(i.quantity)||i.quantity<1)) { res.status(400).json({message:"Invalid checkout items"}); return; }
 const addressSnap=await db.collection("addresses").doc(body.addressId).get(); if(!addressSnap.exists||addressSnap.data()?.userId!==userId){res.status(404).json({message:"Address not found"});return;}
 const address=addressSnap.data()!; const zone=await getDeliveryZoneByPostalCode(String(address.postalCode)); if(!zone){res.status(400).json({message:"Delivery is not available for this postal code"});return;}
 const refs=body.items.map(i=>db.collection("products").doc(i.productId)); const unique=new Set(refs.map(r=>r.id)); if(unique.size!==refs.length){res.status(400).json({message:"Duplicate products are not allowed"});return;}
 let couponResult: Awaited<ReturnType<typeof validateCoupon>>|undefined;
 const snapshots=await db.getAll(...refs); const lineItems:{productId:string;variantId?:string;name:string;quantity:number;unitPrice:number;subtotal:number;category:string}[]=[];
 let subtotal=0;
 for(let n=0;n<body.items.length;n++){const p=snapshots[n];const input=body.items[n];if(!p.exists||p.data()?.isActive!==true){res.status(400).json({message:`Product unavailable: ${input.productId}`});return;}const d=p.data()!;let unitPrice=Number(d.price);let stock=Number(d.stock??0);let name=String(d.name??"");if(input.variantId){const v=(d.variants??[]).find((x:any)=>x.id===input.variantId);if(!v){res.status(400).json({message:"Variant not found"});return;}unitPrice=Number(v.price??unitPrice);stock=Number(v.stock??0);name=`${name} - ${v.name??input.variantId}`;}if(stock<input.quantity){res.status(409).json({message:`Insufficient stock for ${name}`});return;}const line=input.quantity*unitPrice;subtotal+=line;lineItems.push({productId:p.id,variantId:input.variantId,name,quantity:input.quantity,unitPrice,subtotal:line,category:String(d.category??"")});}
 if(subtotal<zone.minimumOrderValue){res.status(400).json({message:`Minimum order value is ${zone.minimumOrderValue}`});return;}
 if(body.couponCode) { try{couponResult=await validateCoupon(body.couponCode,subtotal,userId,lineItems.map(x=>x.category));}catch(e){res.status(400).json({message:e instanceof Error?e.message:"Invalid coupon"});return;} if(couponResult.coupon.perUserLimit!==undefined&&await (await import("../services/coupon.service.js")).getUserCouponUsage(userId,couponResult.coupon.id)>=couponResult.coupon.perUserLimit){res.status(400).json({message:"Your coupon usage limit has been reached"});return;} }
 const delivery=zone.freeDeliveryThreshold!==undefined&&subtotal>=zone.freeDeliveryThreshold?0:zone.baseCharge;const discount=couponResult?.discount??0;const total=Math.max(0,subtotal+delivery-discount);const orderRef=db.collection("orders").doc();const number=`RS-${new Date().toISOString().slice(0,10).replace(/-/g,"")}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
 await db.runTransaction(async tx=>{for(let n=0;n<body.items.length;n++){const p=await tx.get(refs[n]);if(!p.exists)throw new Error("Product changed during checkout");const d=p.data()!;const input=body.items[n];const path=input.variantId?`variants.${input.variantId}.stock`:"stock";const current=input.variantId?Number((d.variants??[]).find((v:any)=>v.id===input.variantId)?.stock??0):Number(d.stock??0);if(current<input.quantity)throw new Error("Stock changed; please retry");if(input.variantId){const variants=(d.variants??[]).map((v:any)=>v.id===input.variantId?{...v,stock:current-input.quantity}:v);tx.update(refs[n],{variants,updatedAt:Timestamp.now()});}else tx.update(refs[n],{stock:current-input.quantity,updatedAt:Timestamp.now()});}
  if(couponResult){const cRef=db.collection("coupons").doc(couponResult.coupon.id);const c=await tx.get(cRef);if(!c.exists||c.data()?.isActive!==true||Number(c.data()?.usageCount??0)>=Number(c.data()?.usageLimit??Infinity))throw new Error("Coupon is no longer available");tx.update(cRef,{usageCount:(Number(c.data()?.usageCount??0)+1),updatedAt:Timestamp.now()});const usageRef=db.collection("coupon_usages").doc(`${userId}_${couponResult.coupon.id}`);const usage=await tx.get(usageRef);tx.set(usageRef,{userId,couponId:couponResult.coupon.id,count:Number(usage.data()?.count??0)+1,updatedAt:Timestamp.now()},{merge:true});}
  tx.set(orderRef,{orderNumber:number,userId,status:"NEW",items:lineItems,subtotal,deliveryCharge:delivery,discount,total,paymentMethod:"COD",paymentStatus:"PENDING",deliveryAddress:{...addressSnap.data(),id:body.addressId},couponId:couponResult?.coupon.id??null,createdAt:Timestamp.now(),updatedAt:Timestamp.now()});
 });
 res.status(201).json({success:true,orderId:orderRef.id,orderNumber:number,subtotal,deliveryCharge:delivery,discount,total,paymentMethod:"COD"});
}

export async function cancelOrder(req:AuthenticatedRequest,res:Response):Promise<void>{const ref=db.collection("orders").doc(req.params.orderId);await db.runTransaction(async tx=>{const d=await tx.get(ref);if(!d.exists||d.data()?.userId!==req.user!.uid)throw new Error("Order not found");const status=d.data()!.status;if(status!=="NEW"&&status!=="CONFIRMED")throw new Error("Order can no longer be cancelled");tx.update(ref,{status:"CANCELLED",cancelledAt:Timestamp.now(),updatedAt:Timestamp.now()});});res.json({success:true,message:"Order cancelled"});}
