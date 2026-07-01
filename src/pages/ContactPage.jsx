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
  contactInfoStyle,
  legalTitleStyle,
  sectionStyle,
  siteStyle,
} from "../styles";

const contactTopics = [
  {
    icon: "🛒",
    title: "Produktfragen",
    text: "Nutze am besten direkt die Produktseite, damit wir sofort wissen, worum es geht.",
  },
  {
    icon: "✨",
    title: "Personalisierung & Extras",
    text: "Wenn du dir eine besondere Variante wünschst, schreib uns gern mit ein paar Details.",
  },
  {
    icon: "💡",
    title: "Individuelle Ideen",
    text: "Manche Ideen entstehen erst unterwegs. Wir schauen gern, was möglich ist.",
  },
];

export default function ContactPage() {
  return (
    <div style={siteStyle}>
      <PublicHeader />

      <section style={sectionStyle}>
        <div style={aboutPageStyle}>
          <p style={{ color: "#7f9b76", fontWeight: "bold", marginTop: 0 }}>
            Schreib uns
          </p>

          <h1 style={legalTitleStyle}>Kontakt zu Camp Oase</h1>

          <p style={aboutIntroStyle}>
            Du hast eine Frage zu einem Produkt, einer Personalisierung oder
            einer Idee? Dann melde dich gern bei uns.
          </p>

          <div style={aboutStoryStyle}>
            Für konkrete Produktfragen nutze am besten direkt auf der
            Produktseite den Button "Frage zum Produkt stellen". So wissen wir
            sofort, um welches Produkt es geht.
          </div>

          <div style={contactInfoStyle}>
            <span>E-Mail</span>
            <a
              href="mailto:service@camp-oase.de"
              style={{
                display: "block",
                color: "#556b5d",
                fontWeight: "bold",
                fontSize: "18px",
                textDecoration: "none",
                overflowWrap: "anywhere",
              }}
            >
              service@camp-oase.de
            </a>
            <p>Wir melden uns so schnell wie möglich zurück.</p>
          </div>

          <div style={aboutCardGridStyle}>
            {contactTopics.map((topic) => (
              <div key={topic.title} style={aboutCardStyle}>
                <span style={aboutCardIconStyle}>{topic.icon}</span>
                <h2>{topic.title}</h2>
                <p>{topic.text}</p>
              </div>
            ))}
          </div>

          <div style={aboutNoteStyle}>
            Camp Oase wächst Schritt für Schritt – daher läuft vieles aktuell
            noch persönlich und direkt.
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
