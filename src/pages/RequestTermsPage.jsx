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

const introBoxStyle = {
  background: "linear-gradient(135deg, #eef3ea, #f7f1e3)",
  border: "1px solid #dbe4d4",
  borderRadius: "20px",
  padding: "20px",
  color: "#435749",
  lineHeight: "1.75",
  margin: "-4px 0 22px",
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

const listStyle = {
  ...textStyle,
  margin: "10px 0 0",
  paddingLeft: "22px",
};

function InfoSection({ title, children }) {
  return (
    <section style={sectionBoxStyle}>
      <h2 style={sectionTitleStyle}>{title}</h2>
      <div style={textStyle}>{children}</div>
    </section>
  );
}

export default function RequestTermsPage() {
  usePageSeo(
    "AGB / Anfragebedingungen | Camp Oase",
    "Anfragebedingungen von Camp Oase für unverbindliche Produkt- und Warenkorbanfragen."
  );

  return (
    <div style={siteStyle}>
      <header style={headerStyle}>
        <Link to="/" style={{ color: "#556b5d", textDecoration: "none" }}>
          ← Zur Startseite
        </Link>
      </header>

      <section style={sectionStyle}>
        <div style={legalContentStyle}>
          <h1 style={legalTitleStyle}>AGB / Anfragebedingungen</h1>

          <section style={introBoxStyle}>
            <p style={textStyle}>
              Camp Oase befindet sich aktuell noch im Aufbau. Über diese
              Webseite erfolgt derzeit kein direkter Online-Kaufabschluss und
              keine automatische Online-Zahlung.
            </p>
            <p style={{ ...textStyle, marginTop: "12px" }}>
              Produktanfragen, Warenkorbanfragen und die Checkout-Vorschau sind
              unverbindliche Anfragewege.
            </p>
          </section>

          <div style={sectionGridStyle}>
            <InfoSection title="1. Unverbindliche Produktanfragen">
              <p style={textStyle}>
                Produkte können aktuell unverbindlich angefragt werden. Eine
                Anfrage über die Webseite ist noch keine verbindliche Bestellung.
              </p>
              <p style={{ ...textStyle, marginTop: "12px" }}>
                Ein Vertrag kommt erst zustande, wenn Camp Oase die Anfrage
                individuell prüft und ausdrücklich bestätigt.
              </p>
            </InfoSection>

            <InfoSection title="2. Individuelle Abstimmung">
              <p style={textStyle}>
                Nach deiner Anfrage können Details wie Verfügbarkeit, Umsetzung,
                Lieferzeit, Versandkosten, Varianten, Extras oder
                Personalisierungswünsche individuell abgestimmt werden.
              </p>
              <p style={{ ...textStyle, marginTop: "12px" }}>
                Änderungen bei Verfügbarkeit, Preis oder Umsetzung können vor
                einer Bestätigung gemeinsam besprochen werden.
              </p>
            </InfoSection>

            <InfoSection title="3. Personalisierte Produkte">
              <p style={textStyle}>
                Personalisierte Produkte werden erst nach Abstimmung gefertigt.
                Dazu können zum Beispiel folgende Angaben gehören:
              </p>
              <ul style={listStyle}>
                <li>Name oder Wunschtext</li>
                <li>Motiv, Farbe oder Designrichtung</li>
                <li>gewählte Variante</li>
                <li>gewählte Extras</li>
                <li>sonstige individuelle Hinweise</li>
              </ul>
            </InfoSection>

            <InfoSection title="4. Preise und Kleinunternehmerregelung">
              <p style={textStyle}>
                Die auf der Webseite angegebenen Preise sind Endpreise. Gemäß §
                19 UStG wird keine Umsatzsteuer ausgewiesen.
              </p>
              <p style={{ ...textStyle, marginTop: "12px" }}>
                Sollte sich bei einer individuellen Anfrage etwas an Preis,
                Umfang oder Umsetzbarkeit ändern, wird dies vor einer
                verbindlichen Bestätigung abgestimmt.
              </p>
            </InfoSection>

            <InfoSection title="5. Zahlung">
              <p style={textStyle}>
                Die Zahlung erfolgt aktuell nach individueller Abstimmung. Es ist
                derzeit keine automatische Online-Zahlung aktiv.
              </p>
              <p style={{ ...textStyle, marginTop: "12px" }}>
                PayPal und Checkout-Funktionen sind technisch vorbereitet, aber
                nicht live geschaltet, solange die spätere Zahlungsfunktion bzw.
                die entsprechende Admin-Einstellung nicht aktiviert ist.
              </p>
            </InfoSection>

            <InfoSection title="6. Versand, Lieferzeit und Verfügbarkeit">
              <p style={textStyle}>
                Versandkosten, Lieferzeit und Verfügbarkeit werden je nach
                Produkt und Anfrage abgestimmt. Gerade bei personalisierten
                Produkten kann die Bearbeitungszeit vom gewünschten Umfang
                abhängen.
              </p>
            </InfoSection>

            <InfoSection title="7. Aktueller Hinweis">
              <p style={textStyle}>
                Diese Anfragebedingungen beschreiben den aktuellen
                unverbindlichen Anfrageprozess von Camp Oase. Sobald ein
                direkter Online-Kauf oder eine aktive Online-Zahlung eingeführt
                wird, können diese Informationen entsprechend angepasst werden.
              </p>
            </InfoSection>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
