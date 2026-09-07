import { db, Timestamp } from "../firebase/firestore.js";

export type CouponType = "PERCENTAGE" | "FIXED";
export interface Coupon { id:string; code:string; type:CouponType; value:number; minOrderValue:number; maxDiscount?:number; usageLimit?:number; usageCount:number; perUserLimit?:number; categoryIds?:string[]; startsAt?:Timestamp; expiresAt?:Timestamp; isActive:boolean; }
export interface CouponResult { coupon: Coupon; discount:number; }

const ref=()=>db.collection("coupons");
export async function getCouponByCode(code:string):Promise<Coupon|null>{ const s=await ref().where("code","==",code.trim().toUpperCase()).where("isActive","==",true).limit(1).get(); return s.empty?null:({id:s.docs[0].id,...s.docs[0].data()} as Coupon); }
export async function validateCoupon(code:string,subtotal:number,userId:string,categoryIds:string[]=[]):Promise<CouponResult>{ const c=await getCouponByCode(code); if(!c) throw new Error("Invalid or inactive coupon"); const now=Date.now(); if(c.startsAt && c.startsAt.toMillis()>now) throw new Error("Coupon is not active yet"); if(c.expiresAt && c.expiresAt.toMillis()<now) throw new Error("Coupon has expired"); if(subtotal<c.minOrderValue) throw new Error(`Minimum order value is ${c.minOrderValue}`); if(c.usageLimit!==undefined&&c.usageCount>=c.usageLimit) throw new Error("Coupon usage limit reached"); if(c.categoryIds?.length&&!categoryIds.some(x=>c.categoryIds!.includes(x))) throw new Error("Coupon does not apply to these products"); const discount=c.type==="PERCENTAGE"?Math.min(subtotal* c.value/100,c.maxDiscount??Infinity):Math.min(c.value,subtotal); return {coupon:c,discount:Math.max(0,Math.round(discount*100)/100)}; }
export async function listCoupons():Promise<Coupon[]>{const s=await ref().orderBy("code").get();return s.docs.map(d=>({id:d.id,...d.data()} as Coupon));}
export async function createCoupon(input:Omit<Coupon,"id"|"usageCount">):Promise<Coupon>{const code=input.code.trim().toUpperCase();const now=Timestamp.now();const d=await ref().add({...input,code,usageCount:0,createdAt:now,updatedAt:now});return{id:d.id,...input,code,usageCount:0};}
export async function updateCoupon(id:string,input:Partial<Omit<Coupon,"id"|"usageCount">>):Promise<void>{await ref().doc(id).update({...input, ...(input.code?{code:input.code.trim().toUpperCase()}:{}),updatedAt:Timestamp.now()});}
export async function deactivateCoupon(id:string):Promise<void>{await ref().doc(id).update({isActive:false,updatedAt:Timestamp.now()});}
export async function getUserCouponUsage(userId:string,couponId:string):Promise<number>{const s=await db.collection("coupon_usages").where("userId","==",userId).where("couponId","==",couponId).limit(1).get();return s.empty?0:(s.docs[0].data().count as number||0);}
