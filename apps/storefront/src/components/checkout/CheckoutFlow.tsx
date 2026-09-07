import { useState } from "react";
import { useCartStore } from "../../lib/cartStore";
import { commerceApi } from "../../services/commerceApi";

export function CheckoutFlow({addressId,postalCode}:{addressId:string;postalCode:string}){
 const {items,subtotal,clear}=useCartStore(); const [coupon,setCoupon]=useState(""); const [discount,setDiscount]=useState(0); const [delivery,setDelivery]=useState<number|null>(null); const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false);
 const apply=async()=>{try{const zone=await commerceApi.lookupDelivery(postalCode);setDelivery(subtotal()>= (zone.freeDeliveryThreshold??Infinity)?0:zone.baseCharge);if(coupon){const r=await commerceApi.validateCoupon(coupon,subtotal(),items.map(i=>i.productId));setDiscount(r.discount);setMessage(`Discount applied: ₹${r.discount.toFixed(2)}`)}}catch(e){setMessage(e instanceof Error?e.message:"Unable to calculate checkout");}};
 const submit=async()=>{setBusy(true);try{const r=await commerceApi.checkout({addressId,items:items.map(i=>({productId:i.productId,variantId:i.variantId,quantity:i.quantity})),couponCode:coupon||undefined});clear();setMessage(`Order ${r.orderNumber} placed. Total ₹${r.total.toFixed(2)}`);}catch(e){setMessage(e instanceof Error?e.message:"Checkout failed; please retry.");}finally{setBusy(false);}};
 return <section><h2>Checkout</h2><p>Subtotal: ₹{subtotal().toFixed(2)}</p><button type="button" onClick={apply}>Calculate delivery</button>{delivery!==null&&<p>Delivery: ₹{delivery.toFixed(2)}</p>}<label>Coupon <input value={coupon} onChange={e=>setCoupon(e.target.value.toUpperCase())}/></label><button type="button" onClick={apply}>Apply coupon</button><p>Discount: ₹{discount.toFixed(2)}</p><p>Total: ₹{Math.max(0,subtotal()+(delivery??0)-discount).toFixed(2)}</p><button type="button" disabled={busy||!items.length} onClick={submit}>Place COD Order</button>{message&&<p role="status">{message}</p>}</section>;
}
