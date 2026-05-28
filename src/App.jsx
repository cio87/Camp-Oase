import React from "react";
import { ShoppingBag, Truck, HeartHandshake, Star, Mail, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const products = [
  {
    name: "Camping Organizer",
    price: "ab 24,90 €",
    description: "Praktische Aufbewahrung für Wohnwagen, Camper und Vorzelt.",
    tag: "Bestseller",
    image: "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Outdoor Küchenhelfer",
    price: "ab 19,90 €",
    description: "Kleine Helfer für entspannteres Kochen unterwegs.",
    tag: "Neu",
    image: "https://images.unsplash.com/photo-1523987355523-c7b5b0723c6a?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Deko fürs Camperleben",
    price: "ab 14,90 €",
    description: "Liebevolle Details für mehr Gemütlichkeit auf Reisen.",
    tag: "Beliebt",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
  },
];

const productTests = [
  products.length === 3,
  products.every((product) => product.name && product.price && product.description && product.image),
  products.every((product) => product.image.startsWith("https://")),
];

if (productTests.some((test) => !test)) {
  console.warn("Camp Oase Produktdaten prüfen: Ein Produkt ist unvollständig.");
}

export default function CampOaseLandingpage() {
  return (
    <main className="min-h-screen bg-[#f4efe6] text-stone-900">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#dbe8d3] via-[#f4efe6] to-[#efe2c6]" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 pb-20 pt-32 md:grid-cols-2 md:items-center lg:px-8">
          <div className="absolute left-6 top-6 flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-2 shadow-md backdrop-blur-sm">
            <img
              src="https://placehold.co/200x200/png"
              alt="Camp Oase Logo"
              className="h-14 w-14 rounded-xl object-contain"
            />
            <div>
              <p className="text-xl font-bold text-[#355b46]">Camp Oase</p>
              <p className="text-sm text-stone-600">Camping • Caravan • Vanlife</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="mb-4 inline-flex rounded-full bg-white/70 px-4 py-2 text-sm font-medium shadow-sm">
              Produkte für Camping, Caravan & Vanlife
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Willkommen bei <span className="text-[#7f9b76]">Camp Oase</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-stone-700">
              Entdecke praktische, schöne und liebevoll ausgewählte Produkte, die dein Campingabenteuer noch entspannter machen.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#produkte"
                className="inline-flex items-center rounded-2xl bg-[#7f9b76] px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-[#6f8a67]"
              >
                Produkte ansehen <ArrowRight className="ml-2 h-5 w-5" />
              </a>
              <a
                href="#kontakt"
                className="inline-flex items-center rounded-2xl bg-white px-6 py-3 font-semibold text-[#355b46] shadow-sm transition hover:bg-stone-100"
              >
                Anfrage senden
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="rounded-[2rem] bg-white p-4 shadow-2xl"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem]">
              <img
                src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=1400&auto=format&fit=crop"
                alt="Camping Lifestyle"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 text-left text-white">
                <p className="mb-2 text-sm uppercase tracking-[0.2em] text-[#dbe8d3]">Camp Oase Collection</p>
                <h2 className="text-3xl font-bold">Camping neu erleben</h2>
                <p className="mt-2 max-w-md text-stone-100">
                  Stilvolle Produkte für Caravan, Wohnmobil und entspannte Abende am Stellplatz.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="produkte" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="max-w-2xl">
          <p className="font-semibold text-[#7f9b76]">Produktübersicht</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Ausgewählte Produkte für deine Camp Oase</h2>
          <p className="mt-4 text-stone-700">
            Diese Platzhalter können wir später durch deine echten Produkte, Bilder, Preise und Beschreibungen ersetzen.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.name}
              className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-stone-200 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-5 overflow-hidden rounded-2xl">
                <img
                  src={product.image}
                  alt={product.name}
                  className="aspect-square w-full object-cover transition duration-500 hover:scale-105"
                />
              </div>
              <span className="rounded-full bg-[#dbe8d3] px-3 py-1 text-sm font-medium text-[#355b46]">{product.tag}</span>
              <h3 className="mt-4 text-xl font-bold">{product.name}</h3>
              <p className="mt-2 text-stone-600">{product.description}</p>
              <div className="mt-5 flex items-center justify-between gap-4">
                <p className="font-bold text-[#7f9b76]">{product.price}</p>
                <button className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-700">
                  Mehr dazu
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 md:grid-cols-3 lg:px-8">
          <div className="rounded-3xl bg-stone-50 p-6">
            <Truck className="mb-4 h-8 w-8 text-[#7f9b76]" />
            <h3 className="text-lg font-bold">Für Camper gedacht</h3>
            <p className="mt-2 text-stone-600">Produkte, die unterwegs wirklich praktisch sind.</p>
          </div>
          <div className="rounded-3xl bg-stone-50 p-6">
            <HeartHandshake className="mb-4 h-8 w-8 text-[#7f9b76]" />
            <h3 className="text-lg font-bold">Mit Liebe ausgewählt</h3>
            <p className="mt-2 text-stone-600">Schöne Dinge, die zum Campinggefühl passen.</p>
          </div>
          <div className="rounded-3xl bg-stone-50 p-6">
            <Star className="mb-4 h-8 w-8 text-[#7f9b76]" />
            <h3 className="text-lg font-bold">Individuell erweiterbar</h3>
            <p className="mt-2 text-stone-600">Später mit Shop, Galerie oder Anfrageformular ausbaubar.</p>
          </div>
        </div>
      </section>

      <section id="kontakt" className="mx-auto max-w-4xl px-6 py-20 text-center lg:px-8">
        <Mail className="mx-auto mb-5 h-10 w-10 text-[#7f9b76]" />
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Interesse an einem Produkt?</h2>
        <p className="mt-4 text-stone-700">
          Schreib uns einfach eine Nachricht. Hier kann später ein Kontaktformular, WhatsApp-Link oder Shop-Button eingefügt werden.
        </p>
        <a
          href="mailto:info@camp-oase.de"
          className="mt-8 inline-flex items-center rounded-2xl bg-[#7f9b76] px-6 py-3 font-semibold text-white shadow-lg hover:bg-[#6f8a67]"
        >
          Kontakt aufnehmen
        </a>
      </section>
    </main>
  );
}
