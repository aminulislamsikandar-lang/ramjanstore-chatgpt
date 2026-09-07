import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCartStore } from "../lib/cartStore";

const navItems = [["Home", "/"], ["Clothes", "/category/clothes"], ["Gas", "/category/gas"], ["Rice", "/category/rice"], ["Agriculture", "/category/agriculture"]] as const;

export default function StorefrontLayout() {
  const navigate = useNavigate(); const location = useLocation();
  const [query, setQuery] = useState(""); const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = useCartStore(s => s.items.reduce((n, item) => n + item.quantity, 0));
  function submitSearch(event: React.FormEvent) { event.preventDefault(); const trimmed = query.trim(); if (trimmed) navigate(`/search?q=${encodeURIComponent(trimmed)}`); }
  return <div className="min-h-screen bg-[linear-gradient(135deg,#eefaf5_0%,#f7f8f8_48%,#eef2ef_100%)] text-[#172B4D]">
    <div className="border-b border-white/80 bg-white/70 px-4 py-2 text-center text-xs font-semibold text-slate-600 backdrop-blur">Local Store • Fast Delivery • Dedicated Support</div>
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 lg:px-6">
        <button aria-label="Open menu" className="rounded-xl p-2 lg:hidden" onClick={() => setMobileOpen(v => !v)}>☰</button>
        <Link to="/" className="min-w-fit leading-tight"><span className="block text-xl font-black tracking-tight text-[#00875A]">RamjanStore</span><span className="hidden text-[10px] font-semibold text-slate-500 sm:block">Your Local Store, Always With You</span></Link>
        <form onSubmit={submitSearch} className="order-3 w-full lg:order-2 lg:max-w-xl lg:flex-1"><div className="flex items-center rounded-2xl border border-slate-200 bg-white px-3 shadow-sm"><span className="text-slate-400">⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search clothes, gas, rice, agriculture..." className="w-full bg-transparent px-3 py-2.5 text-sm outline-none" aria-label="Search products"/><button type="submit" className="rounded-xl bg-[#172B4D] px-3 py-1.5 text-xs font-bold text-white">Search</button></div></form>
        <div className="order-2 ml-auto flex items-center gap-1 lg:order-3"><Link to="/notifications" className="rounded-xl p-2" aria-label="Notifications">🔔</Link><Link to="/account" className="rounded-xl p-2" aria-label="Account">👤</Link><Link to="/cart" className="relative rounded-xl p-2" aria-label="Cart">🛒{cartCount > 0 && <span className="absolute -right-0.5 -top-0.5 min-w-5 rounded-full bg-[#00875A] px-1 text-center text-[10px] font-bold text-white">{cartCount}</span>}</Link></div>
      </div>
      <nav className="mx-auto hidden max-w-7xl items-center gap-7 px-6 pb-3 text-sm font-bold lg:flex">{navItems.map(([label,to]) => <NavLink key={to} to={to} className={({isActive}) => `transition ${isActive ? "text-[#00875A]" : "text-slate-700 hover:text-[#00875A]"}`}>{label}</NavLink>)}<Link to="/wishlist" className="ml-auto text-slate-700 hover:text-[#00875A]">Wishlist</Link></nav>
      {mobileOpen && <nav className="border-t bg-white px-4 py-3 lg:hidden"><div className="grid gap-2">{navItems.map(([label,to]) => <Link key={to} onClick={() => setMobileOpen(false)} to={to} className="rounded-xl px-3 py-2 font-semibold hover:bg-slate-50">{label}</Link>)}<Link onClick={() => setMobileOpen(false)} to="/wishlist" className="rounded-xl px-3 py-2 font-semibold">Wishlist</Link></div></nav>}
    </header>
    <main><Outlet /></main>
    {location.pathname !== "/checkout" && <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto flex max-w-md items-center justify-between rounded-2xl border bg-white/95 p-2 shadow-xl backdrop-blur lg:hidden"><Link to="/" className="flex-1 rounded-xl p-2 text-center text-xs font-bold">⌂<span className="block">Home</span></Link><Link to="/search" className="flex-1 rounded-xl p-2 text-center text-xs font-bold">⌕<span className="block">Search</span></Link><Link to="/wishlist" className="flex-1 rounded-xl p-2 text-center text-xs font-bold">♡<span className="block">Wishlist</span></Link><Link to="/account/orders" className="flex-1 rounded-xl p-2 text-center text-xs font-bold">▣<span className="block">Orders</span></Link><Link to="/cart" className="flex-1 rounded-xl p-2 text-center text-xs font-bold">🛒<span className="block">Cart {cartCount > 0 ? `(${cartCount})` : ""}</span></Link></div>}
    <footer className="mt-16 border-t border-white/70 bg-white/70 pb-24 lg:pb-0"><div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm md:grid-cols-3 lg:px-6"><div><p className="font-black text-[#00875A]">RamjanStore</p><p className="mt-2 text-slate-600">Your Local Store, Always With You.</p></div><div><p className="font-bold">Shop</p><div className="mt-2 grid gap-1 text-slate-600"><Link to="/category/clothes">Clothes</Link><Link to="/category/gas">Gas</Link><Link to="/category/rice">Rice</Link><Link to="/category/agriculture">Agriculture Products</Link></div></div><div><p className="font-bold">Help</p><div className="mt-2 grid gap-1 text-slate-600"><Link to="/account/orders">My Orders</Link><Link to="/messages">Support</Link><Link to="/policies/returns">Returns & Refunds</Link></div></div></div></footer>
  </div>;
}
