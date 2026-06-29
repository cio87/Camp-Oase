import { Routes, Route } from "react-router-dom";
import AboutPage from "./pages/AboutPage";
import AdminPage from "./pages/AdminPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ContactPage from "./pages/ContactPage";
import HomePage from "./pages/HomePage";
import LegalPage from "./pages/LegalPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import MaintenanceGate from "./components/MaintenanceGate";

function publicPage(page) {
  return <MaintenanceGate>{page}</MaintenanceGate>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={publicPage(<HomePage />)} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/produkt/:id" element={publicPage(<ProductDetailPage />)} />
      <Route path="/ueber-uns" element={publicPage(<AboutPage />)} />
      <Route path="/kontakt" element={publicPage(<ContactPage />)} />
      <Route path="/warenkorb" element={publicPage(<CartPage />)} />
      <Route path="/checkout" element={publicPage(<CheckoutPage />)} />
      <Route path="/impressum" element={publicPage(<LegalPage type="impressum" />)} />
      <Route path="/datenschutz" element={publicPage(<LegalPage type="datenschutz" />)} />
    </Routes>
  );
}

