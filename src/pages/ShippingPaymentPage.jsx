import { Link } from "react-router-dom";
import SiteFooter from "../components/SiteFooter";
import { usePageSeo } from "../utils/seo";
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
  usePageSeo(
    "Versand & Zahlung | Camp Oase",
    "Informationen zu Versand, Zahlung und unverbindlichen Anfragen bei Camp Oase."
  );

  return (
    <div style={siteStyle}>
      <header style={headerStyle}>
        <Link to="/" style={{ color: "#556b5d", textDecoration: "none" }}>
          {"\u2190"} Zur Startseite
        </Link>
      </header>

      <section style={sectionStyle}>
        <div style={legalContentStyle}>
          <h1 style={legalTitleStyle}>Versand & Zahlung</h1>

          <p style={introStyle}>
            Hier findest du Informationen zum Ablauf von Produktanfragen,
            Versand und Zahlung bei Camp Oase.
          </p>

          <div style={sectionGridStyle}>
            <InfoSection title="Aktueller Ablauf">
              <p style={textStyle}>
                Camp Oase befindet sich aktuell noch im Aufbau. Produkte und
                Warenkorbinhalte können unverbindlich angefragt werden.
              </p>
              <p style={{ ...textStyle, marginTop: "12px" }}>
                Ist die Online-Zahlung deaktiviert, erfolgt die Abstimmung zu
                Verfügbarkeit, Personalisierungswünschen, Lieferzeit, Versand und
                Zahlung individuell nach deiner Anfrage.
              </p>
              <p style={{ ...textStyle, marginTop: "12px" }}>
                Ein verbindlicher Kaufvertrag kommt erst nach individueller
                Abstimmung und ausdrücklicher Bestätigung zustande. Wenn später
                ein Checkout mit Online-Zahlung aktiviert ist, werden die
                verfügbaren Schritte und Zahlungsarten auf der Website bzw. im
                Checkout angezeigt.
              </p>
            </InfoSection>

            <InfoSection title="Versand">
              <p style={textStyle}>
                Der Versand erfolgt nach individueller Abstimmung und ist
                zunächst für Deutschland vorgesehen.
              </p>
              <p style={{ ...textStyle, marginTop: "12px" }}>
                Versandkosten hängen von Produkt, Größe, Menge und Versandart ab.
                Die konkreten Versandkosten werden vor einer verbindlichen
                Bestätigung bzw. bei aktiviertem Checkout im Bestellprozess klar
                angezeigt.
              </p>
              <p style={{ ...textStyle, marginTop: "12px" }}>
                Bei mehreren Produkten können Versandkosten zusammengefasst
                werden, sofern dies für die jeweilige Anfrage sinnvoll möglich ist.
              </p>
            </InfoSection>

            <InfoSection title="Lieferzeiten">
              <p style={textStyle}>
                Lagerware wird voraussichtlich innerhalb von ca. 3-5 Werktagen
                nach Abstimmung und Zahlung versendet.
              </p>
              <p style={{ ...textStyle, marginTop: "12px" }}>
                Personalisierte Produkte benötigen voraussichtlich ca. 5-10
                Werktage nach finaler Motiv- oder Textfreigabe und Zahlung.
              </p>
              <p style={{ ...textStyle, marginTop: "12px" }}>
                Bei Vorbestellungen richtet sich die Lieferzeit nach der
                Produktangabe oder nach individueller Abstimmung.
              </p>
              <p style={{ ...textStyle, marginTop: "12px" }}>
                Bei hoher Nachfrage, Materialengpässen oder Sonderwünschen kann
                es länger dauern. In diesem Fall wirst du entsprechend
                informiert.
              </p>
            </InfoSection>

            <InfoSection title="Zahlung">
              <p style={textStyle}>
                Die aktuell verfügbaren Zahlungsarten werden im Checkout bzw. im
                Anfrageprozess angezeigt. Ist die Online-Zahlung deaktiviert,
                erfolgt die Zahlungsabstimmung individuell nach deiner Anfrage.
              </p>
              <p style={{ ...textStyle, marginTop: "12px" }}>
                Wenn Online-Zahlung später aktiviert ist, gelten die im Checkout
                angezeigten Zahlungsarten, zum Beispiel PayPal. Versandkosten,
                Lieferzeiten und Zahlungsart werden dann im Checkout bzw. vor
                verbindlicher Bestellung klar angezeigt.
              </p>
              <p style={{ ...textStyle, marginTop: "12px" }}>
                Solange die Online-Zahlung nicht aktiviert ist, wird kein
                PayPal-Button und keine automatische Online-Zahlung angeboten.
              </p>
            </InfoSection>

            <InfoSection title="Preise und Kleinunternehmerregelung">
              <p style={textStyle}>
                Alle angegebenen Produktpreise sind Endpreise. Gegebenenfalls
                anfallende Versandkosten werden vor einer verbindlichen
                Bestätigung bzw. im aktivierten Checkout klar mitgeteilt.
              </p>
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
