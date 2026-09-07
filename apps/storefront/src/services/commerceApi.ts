import { apiClient } from "../lib/apiClient";
export interface DeliveryZone { id:string; name:string; postalCodes:string[]; baseCharge:number; minimumOrderValue:number; freeDeliveryThreshold?:number; isActive:boolean; }
export interface CouponValidation { coupon:{id:string;code:string;type:"PERCENTAGE"|"FIXED";value:number}; discount:number; }
export interface CheckoutInput {items:{productId:string;variantId?:string;quantity:number}[];addressId:string;couponCode?:string;}
export const commerceApi={
 lookupDelivery:async(postalCode:string)=>{const r=await apiClient.get<{zone:DeliveryZone}>(`/delivery-zones/lookup?postalCode=${encodeURIComponent(postalCode)}`);return r.data.zone;},
 validateCoupon:async(code:string,subtotal:number,categoryIds:string[]=[])=>{const r=await apiClient.post<CouponValidation>("/coupons/validate",{code,subtotal,categoryIds});return r.data;},
 checkout:async(input:CheckoutInput)=>{const r=await apiClient.post<{orderId:string;orderNumber:string;subtotal:number;deliveryCharge:number;discount:number;total:number}>("/checkout/process",input);return r.data;},
 cancelOrder:async(orderId:string)=>apiClient.post(`/orders/${orderId}/cancel`)
};
