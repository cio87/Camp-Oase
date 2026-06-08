import { Routes, Route } from "react-router-dom";
import AboutPage from "./pages/AboutPage";
import AdminPage from "./pages/AdminPage";
import ContactPage from "./pages/ContactPage";
import HomePage from "./pages/HomePage";
import LegalPage from "./pages/LegalPage";
import ProductDetailPage from "./pages/ProductDetailPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/produkt/:id" element={<ProductDetailPage />} />
      <Route path="/ueber-uns" element={<AboutPage />} />
      <Route path="/kontakt" element={<ContactPage />} />
      <Route path="/impressum" element={<LegalPage type="impressum" />} />
      <Route path="/datenschutz" element={<LegalPage type="datenschutz" />} />
    </Routes>
  );
}

