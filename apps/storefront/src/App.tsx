import { Link, Route, Routes } from "react-router-dom";

function Home() {
  return (
    <main className="container">
      <p className="eyebrow">HYPERLOCAL COMMERCE</p>
      <h1>RamjanStore</h1>
      <p>Clothes, gas, rice and agriculture products from your local store.</p>
      <nav>
        <Link to="/products">Browse products</Link>
      </nav>
    </main>
  );
}

function Products() {
  return <main className="container"><h1>Products</h1><p>Product catalogue is ready for the API integration.</p></main>;
}

function NotFound() {
  return <main className="container"><h1>404</h1><p>Page not found.</p><Link to="/">Return home</Link></main>;
}

export default function App() {
  return <Routes><Route path="/" element={<Home />} /><Route path="/products" element={<Products />} /><Route path="*" element={<NotFound />} /></Routes>;
}
