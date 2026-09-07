import { apiClient } from "../lib/apiClient";
export interface DeliveryZone { id:string; name:string; postalCodes:string[]; baseCharge:number; minimumOrderValue:number; freeDeliveryThreshold?:number; isActive:boolean; }
export interface CouponValidation { coupon:{id:string;code:string;type:"PERCENTAGE"|"FIXED";value:number}; discount:number; }
export interface CheckoutInput {items:{productId:string;variantId?:string;quantity:number}[];addressId:string;couponCode?:string;}
export const commerceApi={
 lookupDelivery:(postalCode:string)=>apiClient<{zone:DeliveryZone}>(`/delivery-zones/lookup?postalCode=${encodeURIComponent(postalCode)}`),
 validateCoupon:(code:string,subtotal:number,categoryIds:string[]=[])=>apiClient<CouponValidation>("/coupons/validate",{method:"POST",body:JSON.stringify({code,subtotal,categoryIds})}),
 checkout:(input:CheckoutInput)=>apiClient<{orderId:string;orderNumber:string;subtotal:number;deliveryCharge:number;discount:number;total:number}>("/checkout/process",{method:"POST",body:JSON.stringify(input)}),
 cancelOrder:(orderId:string,reason:string)=>apiClient(`/orders/${orderId}/cancel`,{method:"POST",body:JSON.stringify({reason})}),
};
