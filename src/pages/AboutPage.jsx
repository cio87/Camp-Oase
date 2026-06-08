import { Link } from "react-router-dom";
import PublicHeader from "../components/PublicHeader";
import SiteFooter from "../components/SiteFooter";
import {
  aboutCardGridStyle,
  aboutCardIconStyle,
  aboutCardStyle,
  aboutIntroStyle,
  aboutNoteStyle,
  aboutPageStyle,
  aboutStoryStyle,
  buttonStyle,
  legalTitleStyle,
  sectionStyle,
  siteStyle,
} from "../styles";

const aboutCards = [
  {
    icon: "🏕️",
    title: "Handmade mit Herz",
    text: "Kleine Details, ruhige Farben und eine Gestaltung, die sich nach Camping, Zuhause und Lieblingsplatz anfühlt.",
  },
  {
    icon: "✨",
    title: "Persönlich statt Massenware",
    text: "Viele Ideen lassen sich anpassen, damit sie zu deinem Camper, deinem Geschenk oder deiner kleinen Auszeit passen.",
  },
  {
    icon: "🚐",
    title: "Für Camper, Vanlife & kleine Auszeiten",
    text: "Für Wohnwagen, Wohnmobil, Vanlife und alle, die unterwegs gern ein Stück Persönlichkeit dabeihaben.",
  },
];

export default function AboutPage() {
  return (
    <div style={siteStyle}>
      <PublicHeader />

      <section style={sectionStyle}>
        <div style={aboutPageStyle}>
          <p style={{ color: "#7f9b76", fontWeight: "bold", marginTop: 0 }}>
            Willkommen in der Oase
          </p>

          <h1 style={legalTitleStyle}>Über Camp Oase</h1>

          <p style={aboutIntroStyle}>
            Camp Oase entsteht aus der Liebe zu Camping, kleinen Details und
            persönlichen Geschenkideen für unterwegs.
          </p>

          <div style={aboutStoryStyle}>
            Viele Produkte entstehen aus Ideen, die beim Campen, Basteln oder
            Verschenken entstehen. Nicht perfekt von der Stange, sondern mit
            Charakter.
          </div>

          <div style={aboutCardGridStyle}>
            {aboutCards.map((card) => (
              <div key={card.title} style={aboutCardStyle}>
                <span style={aboutCardIconStyle}>{card.icon}</span>
                <h2>{card.title}</h2>
                <p>{card.text}</p>
              </div>
            ))}
          </div>

          <div style={aboutNoteStyle}>
            Camp Oase wächst Schritt für Schritt – mit neuen Ideen, neuen
            Produkten und viel Liebe zum Detail.
          </div>

          <Link
            to="/#produkte"
            style={{
              ...buttonStyle,
              display: "inline-block",
              textDecoration: "none",
              marginTop: "24px",
            }}
          >
            Zur Produktübersicht
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
