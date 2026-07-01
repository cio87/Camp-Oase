import { Link } from "react-router-dom";
import SiteFooter from "../components/SiteFooter";
import {
  headerStyle,
  legalContentStyle,
  legalTitleStyle,
  sectionStyle,
  siteStyle,
} from "../styles";

const introStyle = {
  color: "#7f8f82",
  fontSize: "16px",
  lineHeight: "1.7",
  margin: "-4px 0 26px",
};

const sectionGridStyle = {
  display: "grid",
  gap: "16px",
};

const sectionBoxStyle = {
  background: "rgba(255,255,255,0.72)",
  border: "1px solid #eee7da",
  borderRadius: "18px",
  padding: "18px 20px",
};

const sectionTitleStyle = {
  margin: "0 0 10px",
  color: "#435749",
  fontSize: "18px",
};

const textStyle = {
  margin: 0,
  color: "#555",
  lineHeight: "1.75",
};

const mailLinkStyle = {
  color: "#556b5d",
  fontWeight: "bold",
};

function InfoSection({ title, children }) {
  return (
    <section style={sectionBoxStyle}>
      <h2 style={sectionTitleStyle}>{title}</h2>
      <div style={textStyle}>{children}</div>
    </section>
  );
}

export default function ShippingPaymentPage() {
  return (
    <div style={siteStyle}>
      <header style={headerStyle}>
        <Link to="/" style={{ color: "#556b5d", textDecoration: "none" }}>
          ← Zur Startseite
        </Link>
      </header>

      <section style={sectionStyle}>
        <div style={legalContentStyle}>
          <h1 style={legalTitleStyle}>Versand & Zahlung</h1>

          <p style={introStyle}>
            Hier findest du Informationen zum aktuellen Ablauf von
            Produktanfragen, Versand und Zahlung bei Camp Oase.
          </p>

          <div style={sectionGridStyle}>
            <InfoSection title="Aktueller Bestellablauf">
              <p style={textStyle}>
                Camp Oase befindet sich aktuell noch im Aufbau. Über die Webseite
                erfolgt derzeit kein direkter Kaufabschluss und keine
                Online-Zahlung.
              </p>
              <p style={{ ...textStyle, marginTop: "12px" }}>
                Du kannst Produkte oder deinen Warenkorb unverbindlich anfragen.
                Nach deiner Anfrage melden wir uns bei dir, klären offene
                Details, Personalisierungswünsche, Verfügbarkeit, Lieferzeit und
                die weitere Abwicklung.
              </p>
              <p style={{ ...textStyle, marginTop: "12px" }}>
                Ein verbindlicher Kaufvertrag kommt erst nach individueller
                Abstimmung und ausdrücklicher Bestätigung zustande.
              </p>
            </InfoSection>

            <InfoSection title="Zahlung">
              <p style={textStyle}>
                Aktuell ist keine direkte Online-Zahlung über die Webseite aktiv.
              </p>
              <p style={{ ...textStyle, marginTop: "12px" }}>
                PayPal ist technisch für eine spätere Nutzung vorbereitet, aber
                derzeit nicht live geschaltet. Zahlungsdetails werden aktuell
                individuell nach deiner Anfrage abgestimmt.
              </p>
              <p style={{ ...textStyle, marginTop: "12px" }}>
                Bitte beachte: Solange keine Zahlungsfunktion aktiv ist, wird
                über die Webseite keine Zahlung ausgelöst.
              </p>
            </InfoSection>

            <InfoSection title="Versand">
              <p style={textStyle}>
                Der Versand erfolgt nach individueller Abstimmung und abhängig
                vom jeweiligen Produkt, der gewünschten Personalisierung und der
                Verfügbarkeit.
              </p>
              <p style={{ ...textStyle, marginTop: "12px" }}>
                Die konkreten Versandkosten und die voraussichtliche Lieferzeit
                teilen wir dir im Rahmen der Anfrage oder vor einer verbindlichen
                Bestellung mit.
              </p>
            </InfoSection>

            <InfoSection title="Preise und Kleinunternehmerregelung">
              <p style={textStyle}>Alle angegebenen Preise sind Endpreise.</p>
              <p style={{ ...textStyle, marginTop: "12px" }}>
                Gemäß § 19 UStG wird keine Umsatzsteuer ausgewiesen.
              </p>
            </InfoSection>

            <InfoSection title="Personalisierte Produkte">
              Einige Produkte können individuell angepasst oder personalisiert
              werden. Details zu möglichen Anpassungen, Produktionszeit und
              Versand werden im Rahmen der Anfrage abgestimmt.
            </InfoSection>

            <InfoSection title="Fragen zu Versand oder Zahlung">
              Bei Fragen erreichst du uns unter:{" "}
              <a href="mailto:service@camp-oase.de" style={mailLinkStyle}>
                service@camp-oase.de
              </a>
            </InfoSection>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
