import { Link, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import StorefrontLayout from "./components/StorefrontLayout";
import ProductDetail from "./pages/ProductDetail";
import Wishlist from "./pages/Wishlist";
import OrderTracking from "./pages/OrderTracking";

const categories = [
  { key: "clothes", name: "Clothes", sub: "Men • Women • Kids", icon: "👕" },
  { key: "gas", name: "Gas", sub: "Indane • HP Gas • Bharat Gas", icon: "🛢️" },
  { key: "rice", name: "Rice", sub: "Premium Quality Rice", icon: "🌾" },
  { key: "agriculture", name: "Agriculture Products", sub: "Khad • Crop Care • Medicines", icon: "🌱" },
] as const;

function Home() {
  return <div>
    <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-10 pt-10 lg:grid-cols-[1.1fr_.9fr] lg:px-6 lg:pt-16">
      <div className="flex flex-col justify-center">
        <span className="w-fit rounded-full border border-[#00875A]/20 bg-white/70 px-4 py-2 text-xs font-extrabold uppercase tracking-[.16em] text-[#00875A]">Local Store • Better Tomorrow</span>
        <h1 className="mt-5 text-4xl font-black leading-tight text-[#172B4D] sm:text-5xl lg:text-6xl">আপোনাৰ সকলো প্ৰয়োজন এটা দোকানতেই</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">কাপোৰ, গেছ, চাউল আৰু কৃষি সামগ্ৰী এতিয়া অনলাইন RamjanStore ত</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link to="/products" className="rounded-2xl bg-[#00875A] px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-[#00875A]/20 transition hover:-translate-y-0.5">Shop Now →</Link>
          <Link to="/category/gas" className="rounded-2xl border border-slate-200 bg-white/80 px-6 py-3.5 text-sm font-bold text-[#172B4D]">Order Gas</Link>
        </div>
        <div className="mt-8 grid max-w-xl grid-cols-3 gap-3 text-xs font-bold text-slate-600">
          <div className="rounded-2xl bg-white/65 p-3 shadow-sm">⚡ Fast Delivery</div><div className="rounded-2xl bg-white/65 p-3 shadow-sm">🔒 Secure Payments</div><div className="rounded-2xl bg-white/65 p-3 shadow-sm">💬 Dedicated Support</div>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/50 p-3 shadow-xl backdrop-blur">
        <div className="grid h-full min-h-[350px] grid-cols-2 gap-3">
          <div className="flex flex-col gap-3"><div className="flex-1 rounded-3xl bg-gradient-to-br from-emerald-50 to-white p-6 text-5xl">👕</div><div className="rounded-3xl bg-gradient-to-br from-red-50 to-white p-6 text-5xl">🛢️</div></div>
          <div className="flex flex-col gap-3"><div className="rounded-3xl bg-gradient-to-br from-amber-50 to-white p-6 text-5xl">🌾</div><div className="flex-1 rounded-3xl bg-gradient-to-br from-green-50 to-white p-6 text-5xl">🌱</div></div>
        </div>
        <div className="absolute bottom-7 left-7 right-7 rounded-2xl bg-white/85 p-4 shadow-lg backdrop-blur"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">From Our Land to Your Home</p><p className="mt-1 font-black text-[#172B4D]">Good Products Brighter Futures</p></div>
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-4 lg:px-6"><div className="mb-5 flex items-end justify-between"><div><h2 className="text-2xl font-black">Shop by Category</h2><p className="mt-1 text-sm text-slate-500">Everything you need from your local store</p></div></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{categories.map(c => <Link key={c.key} to={`/category/${c.key}`} className="group rounded-3xl border border-white/80 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><div className="flex items-start justify-between"><span className="text-4xl">{c.icon}</span><span className="rounded-full bg-slate-50 px-3 py-1 text-sm transition group-hover:bg-[#00875A] group-hover:text-white">→</span></div><h3 className="mt-5 font-black">{c.name}</h3><p className="mt-1 text-xs text-slate-500">{c.sub}</p></Link>)}</div></section>
    <section className="mx-auto mt-10 max-w-7xl px-4 lg:px-6"><div className="grid gap-3 rounded-3xl border border-white/70 bg-white/50 p-3 shadow-sm sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-2xl px-4 py-3 text-sm font-bold">✅ Wide Range – All Your Needs</div><div className="rounded-2xl px-4 py-3 text-sm font-bold">⭐ Trusted Store – Quality Assured</div><div className="rounded-2xl px-4 py-3 text-sm font-bold">🚚 On-Time Delivery – Fast & Reliable</div><Link to="/messages" className="rounded-2xl px-4 py-3 text-sm font-bold hover:bg-white/70">💬 Customer Support – Always Here</Link></div></section>
    <section className="mx-auto mt-10 max-w-7xl px-4 lg:px-6"><div className="relative overflow-hidden rounded-[2rem] bg-[#172B4D] p-7 text-white sm:p-10"><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-300">Support Local, Grow Together</p><h2 className="mt-3 max-w-2xl text-3xl font-black sm:text-4xl">Good Products Brighter Futures</h2><p className="mt-2 max-w-xl text-sm text-slate-200">From Our Land to Your Home</p><Link to="/category/agriculture" className="mt-6 inline-flex rounded-2xl bg-[#00875A] px-5 py-3 text-sm font-black">Shop Agriculture →</Link></div></section>
    <section className="mx-auto max-w-7xl px-4 py-12 lg:px-6"><div className="flex items-end justify-between"><div><h2 className="text-2xl font-black">Popular Products</h2><p className="mt-1 text-sm text-slate-500">Handpicked for you</p></div><Link to="/products" className="text-sm font-black text-[#00875A]">View All →</Link></div><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{["Folded Shirt","Indane Gas Cylinder","Premium Rice","Fertilizer Pack"].map((name,i) => <Link key={name} to={`/products?featured=${i+1}`} className="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className="flex aspect-square items-center justify-center rounded-2xl bg-slate-50 text-6xl">{["👕","🛢️","🌾","🌱"][i]}</div><div className="mt-4 flex items-center justify-between"><div><p className="font-black">{name}</p><p className="mt-1 text-xs text-slate-500">Bestseller · Quality Assured</p></div><span className="font-black text-[#00875A]">→</span></div></Link>)}</div></section>
  </div>;
}

function Category() { return <main className="mx-auto max-w-7xl px-4 py-12 lg:px-6"><h1 className="text-4xl font-black">Shop Category</h1><p className="mt-2 text-slate-600">Filter, sort and browse products for this category.</p><Link className="mt-6 inline-flex rounded-2xl bg-[#00875A] px-5 py-3 font-bold text-white" to="/products">View Products →</Link></main>; }
function Products() { return <main className="mx-auto max-w-7xl px-4 py-12 lg:px-6"><div className="rounded-3xl border border-white/80 bg-white/80 p-8 shadow-sm"><h1 className="text-4xl font-black">All Products</h1><p className="mt-2 text-slate-600">Your product catalogue is ready for the live API.</p><Link to="/category/clothes" className="mt-6 inline-flex rounded-2xl bg-[#00875A] px-5 py-3 font-bold text-white">Start Shopping →</Link></div></main>; }
function Simple({title,body}:{title:string;body:string}) { return <main className="mx-auto max-w-4xl px-4 py-12 lg:px-6"><div className="rounded-3xl border border-white/80 bg-white/80 p-8 shadow-sm"><h1 className="text-3xl font-black">{title}</h1><p className="mt-3 text-slate-600">{body}</p><Link to="/" className="mt-6 inline-flex font-bold text-[#00875A]">← Back home</Link></div></main>; }

function App(){return <AuthProvider><Routes><Route element={<StorefrontLayout/>}><Route path="/" element={<Home/>}/><Route path="/products" element={<Products/>}/><Route path="/category/:category" element={<Category/>}/><Route path="/product/:slug" element={<ProductDetail/>}/><Route path="/cart" element={<Simple title="Your Cart" body="Your cart items will appear here. Continue shopping to add products."/>}/><Route path="/checkout" element={<Simple title="Checkout" body="Choose an address, review delivery charges and place your order."/>}/><Route path="/notifications" element={<Simple title="Notifications" body="Order updates, replies and activity will appear here."/>}/><Route path="/account" element={<Simple title="Account" body="Manage your profile, orders, addresses, wishlist and support messages."/>}/><Route path="/account/orders" element={<Simple title="My Orders" body="Your recent orders and tracking links will appear here."/>}/><Route path="/messages" element={<Simple title="Support" body="Start a conversation with RamjanStore support."/>}/><Route path="/policies/returns" element={<Simple title="Returns & Refunds" body="Return eligibility and refund policies will be published here."/>}/><Route element={<ProtectedRoute/>}><Route path="/orders/:id" element={<OrderTracking/>}/><Route path="/wishlist" element={<Wishlist/>}/></Route><Route path="/search" element={<Simple title="Search Results" body="Search results will be connected to the backend catalogue."/>}/><Route path="*" element={<Simple title="Page Not Found" body="We couldn't find that page."/>}/></Route></Routes></AuthProvider>}
export default App;
