import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MaintenanceGate from "./components/MaintenanceGate";

const AboutPage = lazy(() => import("./pages/AboutPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const ShippingPaymentPage = lazy(() => import("./pages/ShippingPaymentPage"));
const WithdrawalPage = lazy(() => import("./pages/WithdrawalPage"));

function LoadingPage() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "grid",
        placeItems: "center",
        color: "#556b5d",
        background: "#f5f1e8",
        fontWeight: "bold",
      }}
    >
      Lädt...
    </div>
  );
}

function lazyPage(page) {
  return <Suspense fallback={<LoadingPage />}>{page}</Suspense>;
}

function publicPage(page) {
  return <MaintenanceGate>{lazyPage(page)}</MaintenanceGate>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={publicPage(<HomePage />)} />
      <Route path="/admin" element={lazyPage(<AdminPage />)} />
      <Route path="/produkt/:id" element={publicPage(<ProductDetailPage />)} />
      <Route path="/ueber-uns" element={publicPage(<AboutPage />)} />
      <Route path="/kontakt" element={publicPage(<ContactPage />)} />
      <Route path="/warenkorb" element={publicPage(<CartPage />)} />
      <Route path="/checkout" element={publicPage(<CheckoutPage />)} />
      <Route path="/impressum" element={publicPage(<LegalPage type="impressum" />)} />
      <Route path="/datenschutz" element={publicPage(<LegalPage type="datenschutz" />)} />
      <Route path="/versand-zahlung" element={publicPage(<ShippingPaymentPage />)} />
      <Route path="/widerruf" element={publicPage(<WithdrawalPage />)} />
    </Routes>
  );
}

