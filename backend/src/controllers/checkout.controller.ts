import type { Response } from "express";
import { db, Timestamp } from "../firebase/firestore.js";
import { getDeliveryZoneByPostalCode } from "../services/deliveryZone.service.js";
import { validateCoupon } from "../services/coupon.service.js";
import type { AuthenticatedRequest } from "../middleware/authenticate.js";

interface CheckoutItem { productId:string; variantId?:string; quantity:number; }
interface CheckoutBody { items:CheckoutItem[]; addressId:string; couponCode?:string; idempotencyKey?:string; }
const KEY_RE=/^[A-Za-z0-9_-]{16,100}$/;
const STATUS="NEW" as const;

export async function processCheckout(req:AuthenticatedRequest,res:Response):Promise<void>{
 const userId=req.user!.uid,body=req.body as CheckoutBody,key=String(req.header("Idempotency-Key")??body.idempotencyKey??"");
 if(!KEY_RE.test(key)) return void res.status(400).json({message:"A valid Idempotency-Key (16-100 characters) is required"});
 const idemRef=db.collection("checkout_idempotency").doc(`${userId}_${key}`);
 const existing=await idemRef.get(); if(existing.exists){const d=existing.data()!;return void res.status(Number(d.httpStatus??201)).json(d.response);}
 if(!Array.isArray(body.items)||!body.items.length||!body.addressId)return void res.status(400).json({message:"Items and addressId are required"});
 if(body.items.some(i=>!i.productId||!Number.isInteger(i.quantity)||i.quantity<1||i.quantity>100))return void res.status(400).json({message:"Invalid checkout items"});
 const addressSnap=await db.collection("addresses").doc(body.addressId).get();
 if(!addressSnap.exists||addressSnap.data()?.userId!==userId)return void res.status(404).json({message:"Address not found"});
 const zone=await getDeliveryZoneByPostalCode(String(addressSnap.data()!.postalCode));if(!zone)return void res.status(400).json({message:"Delivery is not available for this postal code"});
 const refs=body.items.map(i=>db.collection("products").doc(i.productId));if(new Set(refs.map(r=>r.id)).size!==refs.length)return void res.status(400).json({message:"Duplicate products are not allowed"});
 const snapshots=await db.getAll(...refs),lineItems:{productId:string;variantId?:string;name:string;quantity:number;unitPrice:number;subtotal:number;category:string}[]=[];let subtotal=0;
 for(let n=0;n<body.items.length;n++){const p=snapshots[n],input=body.items[n];if(!p.exists||p.data()?.isActive!==true)return void res.status(400).json({message:`Product unavailable: ${input.productId}`});const d=p.data()!;let unitPrice=Number(d.price),stock=Number(d.stock??0),name=String(d.name??"");if(input.variantId){const variants=Array.isArray(d.variants)?d.variants:[],v=variants.find((x:{id?:string})=>x.id===input.variantId) as {id:string;price?:number;stock?:number;name?:string}|undefined;if(!v)return void res.status(400).json({message:"Variant not found"});unitPrice=Number(v.price??unitPrice);stock=Number(v.stock??0);name=`${name} - ${v.name??input.variantId}`;}if(!Number.isFinite(unitPrice)||unitPrice<0||stock<input.quantity)return void res.status(409).json({message:`Insufficient stock for ${name}`});const line=input.quantity*unitPrice;subtotal+=line;lineItems.push({productId:p.id,variantId:input.variantId,name,quantity:input.quantity,unitPrice,subtotal:line,category:String(d.category??"")});}
 if(subtotal<zone.minimumOrderValue)return void res.status(400).json({message:`Minimum order value is ${zone.minimumOrderValue}`});
 let discount=0,couponId:string|undefined;if(body.couponCode){try{const result=await validateCoupon(body.couponCode,subtotal,userId,lineItems.map(x=>x.category));discount=result.discount;couponId=result.coupon.id;}catch(e){return void res.status(400).json({message:e instanceof Error?e.message:"Invalid coupon"});}}
 const delivery=zone.freeDeliveryThreshold!==undefined&&subtotal>=zone.freeDeliveryThreshold?0:zone.baseCharge,total=Math.max(0,subtotal+delivery-discount),orderRef=db.collection("orders").doc(),number=`RS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
 const response={success:true,orderId:orderRef.id,orderNumber:number,subtotal,deliveryCharge:delivery,discount,total,paymentMethod:"COD"};
 try{await db.runTransaction(async tx=>{
   const existingIdem=await tx.get(idemRef);if(existingIdem.exists)throw new Error("IDEMPOTENCY_REPLAY");
   const productDocs=await Promise.all(refs.map(r=>tx.get(r)));let couponDoc=null,usageDoc=null;
   if(couponId){couponDoc=await tx.get(db.collection("coupons").doc(couponId));usageDoc=await tx.get(db.collection("coupon_usages").doc(`${userId}_${couponId}`));}
   for(let n=0;n<productDocs.length;n++){const p=productDocs[n],input=body.items[n];if(!p.exists||p.data()?.isActive!==true)throw new Error("Product changed; please retry");const d=p.data()!;if(input.variantId){const variants=(Array.isArray(d.variants)?d.variants:[]) as Array<Record<string,unknown>>;const v=variants.find(x=>x.id===input.variantId);if(!v||Number(v.stock??0)<input.quantity)throw new Error("Stock changed; please retry");tx.update(refs[n],{variants:variants.map(x=>x.id===input.variantId?{...x,stock:Number(x.stock)-input.quantity}:x),updatedAt:Timestamp.now()});}else{const stock=Number(d.stock??0);if(stock<input.quantity)throw new Error("Stock changed; please retry");tx.update(refs[n],{stock:stock-input.quantity,updatedAt:Timestamp.now()});}}
   if(couponId&&couponDoc){const d=couponDoc.data()!;const limit=d.usageLimit===undefined?Infinity:Number(d.usageLimit),used=Number(d.usageCount??0),userUsed=Number(usageDoc?.data()?.count??0);if(!couponDoc.exists||d.isActive!==true||used>=limit)throw new Error("Coupon is no longer available");if(d.perUserLimit!==undefined&&userUsed>=Number(d.perUserLimit))throw new Error("Your coupon usage limit has been reached");tx.update(db.collection("coupons").doc(couponId),{usageCount:used+1,updatedAt:Timestamp.now()});tx.set(db.collection("coupon_usages").doc(`${userId}_${couponId}`),{userId,couponId,count:userUsed+1,updatedAt:Timestamp.now()},{merge:true});}
   tx.set(orderRef,{orderNumber:number,userId,status:STATUS,items:lineItems,subtotal,deliveryCharge:delivery,discount,total,paymentMethod:"COD",paymentStatus:"PENDING",deliveryAddress:{...addressSnap.data(),id:body.addressId},couponId:couponId??null,createdAt:Timestamp.now(),updatedAt:Timestamp.now()});
   tx.create(idemRef,{userId,key,orderId:orderRef.id,response,httpStatus:201,createdAt:Timestamp.now()});
 });
 }catch(e){if(e instanceof Error&&e.message==="IDEMPOTENCY_REPLAY"){const replay=await idemRef.get();if(replay.exists)return void res.status(Number(replay.data()?.httpStatus??201)).json(replay.data()?.response);}return void res.status(409).json({message:e instanceof Error?e.message:"Checkout could not be completed"});}
 res.status(201).json(response);
}

export async function cancelOrder(req:AuthenticatedRequest,res:Response):Promise<void>{
 const ref=db.collection("orders").doc(req.params.orderId);
 const rawReason=typeof req.body?.reason === "string" ? req.body.reason.trim() : "";
 if(rawReason.length>500)return void res.status(400).json({message:"Cancellation reason must be 500 characters or fewer"});
 const reason=rawReason||"Customer requested cancellation";
 try{await db.runTransaction(async tx=>{
   const d=await tx.get(ref);
   if(!d.exists||d.data()?.userId!==req.user!.uid)throw new Error("Order not found");
   const order=d.data()!;
   if(!["NEW","CONFIRMED"].includes(String(order.status)))throw new Error("Order can no longer be cancelled");
   if(order.inventoryRestoredAt)throw new Error("Order inventory has already been restored");
   const items=Array.isArray(order.items)?order.items as Array<Record<string,unknown>>:[];
   const productIds=[...new Set(items.map(i=>String(i.productId)).filter(Boolean))];
   const productRefs=productIds.map(id=>db.collection("products").doc(id));
   const productDocs=await Promise.all(productRefs.map(r=>tx.get(r)));
   for(let n=0;n<productDocs.length;n++){
     const p=productDocs[n];if(!p.exists)throw new Error("Product no longer exists; contact support for inventory reconciliation");
     const product=p.data()!,variants=Array.isArray(product.variants)?product.variants as Array<Record<string,unknown>>:null;
     const matching=items.filter(i=>String(i.productId)===productRefs[n].id);
     if(variants){let next=variants;for(const item of matching){if(!item.variantId)throw new Error("Invalid order inventory snapshot");const variant=next.find(v=>v.id===item.variantId),qty=Number(item.quantity);if(!variant||!Number.isInteger(qty)||qty<1)throw new Error("Invalid order inventory snapshot");next=next.map(v=>v.id===item.variantId?{...v,stock:Number(v.stock??0)+qty}:v);}tx.update(productRefs[n],{variants:next,updatedAt:Timestamp.now()});}
     else{const add=matching.reduce((sum,i)=>sum+Number(i.quantity),0);if(!Number.isInteger(add)||add<1)throw new Error("Invalid order quantity");tx.update(productRefs[n],{stock:Number(product.stock??0)+add,updatedAt:Timestamp.now()});}
   }
   if(order.couponId){const couponRef=db.collection("coupons").doc(String(order.couponId)),usageRef=db.collection("coupon_usages").doc(`${req.user!.uid}_${order.couponId}`);const [couponSnap,usageSnap]=await Promise.all([tx.get(couponRef),tx.get(usageRef)]);if(couponSnap.exists){const used=Math.max(0,Number(couponSnap.data()?.usageCount??0));tx.update(couponRef,{usageCount:Math.max(0,used-1),updatedAt:Timestamp.now()});}if(usageSnap.exists){const count=Math.max(0,Number(usageSnap.data()?.count??0));if(count<=1)tx.delete(usageRef);else tx.update(usageRef,{count:count-1,updatedAt:Timestamp.now()});}}
   tx.update(ref,{status:"CANCELLED",cancellationReason:reason,cancelledAt:Timestamp.now(),inventoryRestoredAt:Timestamp.now(),couponUsageRevertedAt:order.couponId?Timestamp.now():null,updatedAt:Timestamp.now()});
 });res.json({success:true,message:"Order cancelled and inventory restored"});
 }catch(e){res.status(409).json({message:e instanceof Error?e.message:"Cancellation failed"});}
}
