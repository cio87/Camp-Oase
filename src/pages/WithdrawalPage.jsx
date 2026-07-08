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

const mailLinkStyle = {
  color: "#556b5d",
  fontWeight: "bold",
};

const noticeBoxStyle = {
  ...introBoxStyle,
  margin: 0,
};

function InfoSection({ title, children }) {
  return (
    <section style={sectionBoxStyle}>
      <h2 style={sectionTitleStyle}>{title}</h2>
      <div style={textStyle}>{children}</div>
    </section>
  );
}

function ContactMail() {
  return (
    <a href="mailto:service@camp-oase.de" style={mailLinkStyle}>
      service@camp-oase.de
    </a>
  );
}

export default function WithdrawalPage() {
  usePageSeo(
    "Widerruf | Camp Oase",
    "Informationen zum Widerruf und zu personalisierten Produkten bei Camp Oase."
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
          <h1 style={legalTitleStyle}>Widerruf</h1>

          <section style={introBoxStyle}>
            <p style={textStyle}>
              Camp Oase befindet sich aktuell noch im Aufbau. Über diese Webseite
              erfolgt derzeit kein direkter Kaufabschluss und keine Online-Zahlung.
              Produktanfragen, Warenkorbanfragen und die Checkout-Vorschau sind
              unverbindlich.
            </p>
            <p style={{ ...textStyle, marginTop: "12px" }}>
              Die nachfolgenden Informationen dienen der Vorbereitung für einen
              späteren verbindlichen Verkauf über diese Webseite.
            </p>
          </section>

          <div style={sectionGridStyle}>
            <InfoSection title="Widerrufsrecht für Verbraucher">
              <p style={textStyle}>
                Verbrauchern steht bei Fernabsatzverträgen grundsätzlich ein
                gesetzliches Widerrufsrecht zu. Die Widerrufsfrist beträgt in der
                Regel 14 Tage ab dem Tag, an dem du oder eine von dir benannte
                Person die Ware erhalten hast.
              </p>
              <p style={{ ...textStyle, marginTop: "12px" }}>
                Um dein Widerrufsrecht auszuüben, musst du uns mittels einer
                eindeutigen Erklärung über deinen Entschluss informieren, den
                Vertrag zu widerrufen.
              </p>
              <p style={{ ...textStyle, marginTop: "14px" }}>
                <strong>Kontakt für Widerruf:</strong>
                <br />
                Brian Hillier
                <br />
                Camp Oase
                <br />
                Uelzener Str. 9
                <br />
                33719 Bielefeld
                <br />
                Deutschland
                <br />
                <br />
                E-Mail: <ContactMail />
              </p>
            </InfoSection>

            <section style={noticeBoxStyle}>
              <h2 style={sectionTitleStyle}>
                Personalisierte Produkte und Sonderanfertigungen
              </h2>
              <p style={textStyle}>
                Einige Produkte von Camp Oase können individuell angepasst,
                personalisiert oder nach Kundenwunsch angefertigt werden.
              </p>
              <p style={{ ...textStyle, marginTop: "12px" }}>
                Bei Waren, die nicht vorgefertigt sind und für deren Herstellung
                eine individuelle Auswahl oder Bestimmung durch den Kunden
                maßgeblich ist oder die eindeutig auf persönliche Bedürfnisse
                zugeschnitten sind, kann das gesetzliche Widerrufsrecht
                ausgeschlossen sein.
              </p>
              <p style={{ ...textStyle, marginTop: "12px" }}>
                Ob ein Produkt personalisiert oder als Sonderanfertigung gilt,
                wird vor einer verbindlichen Bestellung klar abgestimmt und
                bestätigt.
              </p>
            </section>

            <InfoSection title="Muster-Widerrufsformular">
              <p style={textStyle}>
                Wenn du den Vertrag widerrufen möchtest, kannst du dieses Formular
                verwenden und an uns senden:
              </p>
              <p style={{ ...textStyle, marginTop: "14px" }}>
                <strong>An:</strong>
                <br />
                Brian Hillier
                <br />
                Camp Oase
                <br />
                Uelzener Str. 9
                <br />
                33719 Bielefeld
                <br />
                Deutschland
                <br />
                E-Mail: <ContactMail />
              </p>
              <p style={{ ...textStyle, marginTop: "14px" }}>
                Hiermit widerrufe ich den von mir abgeschlossenen Vertrag über
                den Kauf der folgenden Waren:
              </p>
              <ul style={listStyle}>
                <li>Bestellt am:</li>
                <li>Erhalten am:</li>
                <li>Name des Verbrauchers:</li>
                <li>Anschrift des Verbrauchers:</li>
                <li>E-Mail-Adresse:</li>
                <li>Datum:</li>
                <li>Unterschrift, nur bei Mitteilung auf Papier:</li>
              </ul>
            </InfoSection>

            <InfoSection title="Hinweis">
              Diese Widerrufsseite ist für den späteren verbindlichen Verkauf
              vorbereitet. Solange über die Webseite kein direkter Kaufabschluss
              erfolgt, gelten Produkt- und Warenkorbanfragen weiterhin als
              unverbindliche Anfragen.
            </InfoSection>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
