import { Link } from "react-router-dom";
import SiteFooter from "../components/SiteFooter";
import {
  headerStyle,
  legalContentStyle,
  legalTitleStyle,
  sectionStyle,
  siteStyle,
} from "../styles";

const legalIntroStyle = {
  color: "#7f8f82",
  fontSize: "15px",
  fontWeight: "bold",
  margin: "-6px 0 26px",
};

const legalSectionGridStyle = {
  display: "grid",
  gap: "16px",
};

const legalSectionBoxStyle = {
  background: "rgba(255,255,255,0.72)",
  border: "1px solid #eee7da",
  borderRadius: "18px",
  padding: "18px 20px",
};

const legalSectionTitleStyle = {
  margin: "0 0 10px",
  color: "#435749",
  fontSize: "18px",
};

const legalTextStyle = {
  margin: 0,
  color: "#555",
  lineHeight: "1.75",
};

const legalMailLinkStyle = {
  color: "#556b5d",
  fontWeight: "bold",
};

const legalNoticeBoxStyle = {
  marginTop: "18px",
  background: "linear-gradient(135deg, #eef3ea, #f7f1e3)",
  border: "1px solid #dbe4d4",
  borderRadius: "20px",
  padding: "20px",
};

function LegalSection({ title, children }) {
  return (
    <section style={legalSectionBoxStyle}>
      <h2 style={legalSectionTitleStyle}>{title}</h2>
      <div style={legalTextStyle}>{children}</div>
    </section>
  );
}

function ContactMail() {
  return (
    <a href="mailto:service@camp-oase.de" style={legalMailLinkStyle}>
      service@camp-oase.de
    </a>
  );
}

export default function LegalPage({ type }) {
  const isImpressum = type === "impressum";

  return (
    <div style={siteStyle}>
      <header style={headerStyle}>
        <Link to="/" style={{ color: "#556b5d", textDecoration: "none" }}>
          ← Zur Startseite
        </Link>
      </header>

      <section style={sectionStyle}>
        <div style={legalContentStyle}>
          <h1 style={legalTitleStyle}>
            {isImpressum ? "Impressum" : "Datenschutzerklärung"}
          </h1>

          {isImpressum ? (
            <>
              <p style={legalIntroStyle}>Angaben gemäß § 5 DDG</p>

              <div style={legalSectionGridStyle}>
                <LegalSection title="Anbieter">
                  Brian Hillier
                  <br />
                  Camp Oase
                  <br />
                  Uelzener Str. 9
                  <br />
                  33719 Bielefeld
                  <br />
                  Deutschland
                </LegalSection>

                <LegalSection title="Kontakt">
                  E-Mail: <ContactMail />
                </LegalSection>

                <LegalSection title="Umsatzsteuer">
                  Als Kleinunternehmer im Sinne von § 19 UStG wird keine
                  Umsatzsteuer ausgewiesen.
                </LegalSection>

                <LegalSection title="Verantwortlich für den Inhalt">
                  Brian Hillier
                  <br />
                  Uelzener Str. 9
                  <br />
                  33719 Bielefeld
                  <br />
                  Deutschland
                </LegalSection>

                <LegalSection title="Verbraucherstreitbeilegung">
                  Wir sind nicht verpflichtet und nicht bereit, an
                  Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
                  teilzunehmen.
                </LegalSection>
              </div>

              <section style={legalNoticeBoxStyle}>
                <h2 style={legalSectionTitleStyle}>
                  Hinweis zum aktuellen Angebot
                </h2>
                <p style={legalTextStyle}>
                  Über diese Webseite erfolgt derzeit kein direkter Kaufabschluss
                  und keine Online-Zahlung. Produktanfragen und Warenkorbanfragen
                  sind unverbindlich. Ein verbindlicher Kaufvertrag kommt erst nach
                  individueller Abstimmung und ausdrücklicher Bestätigung zustande.
                </p>
              </section>
            </>
          ) : (
            <>
              <p style={legalIntroStyle}>
                Informationen zur Verarbeitung personenbezogener Daten auf dieser
                Webseite
              </p>

              <div style={legalSectionGridStyle}>
                <LegalSection title="1. Verantwortlicher">
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
                </LegalSection>

                <LegalSection title="2. Allgemeine Hinweise zur Datenverarbeitung">
                  Wir verarbeiten personenbezogene Daten nur, soweit dies zur
                  Bereitstellung dieser Webseite, zur Bearbeitung von Anfragen
                  oder zur technischen Verwaltung erforderlich ist. Über diese
                  Webseite erfolgt derzeit kein direkter Kaufabschluss und keine
                  Online-Zahlung. Produktanfragen, Warenkorbanfragen und die
                  Checkout-Vorschau sind unverbindliche Anfragewege.
                </LegalSection>

                <LegalSection title="3. Hosting und Server-Logfiles / Vercel">
                  Diese Webseite wird über Vercel bereitgestellt. Beim Aufruf der
                  Webseite können technisch erforderliche Server-Logfiles
                  verarbeitet werden, zum Beispiel IP-Adresse, Datum und Uhrzeit
                  des Zugriffs, aufgerufene Seiten, Browserinformationen,
                  Betriebssystem und Referrer-URL. Die Verarbeitung erfolgt zur
                  sicheren und stabilen Bereitstellung der Webseite.
                </LegalSection>

                <LegalSection title="4. Nutzung von Supabase für Datenbank, Auth und Storage">
                  Für Datenbankfunktionen, Admin-Login und Bildspeicherung wird
                  Supabase eingesetzt. Produktanfragen und Warenkorbanfragen
                  werden in Supabase gespeichert. Der Admin-Login läuft über
                  Supabase Auth. Produktbilder werden über Supabase Storage
                  geladen.
                </LegalSection>

                <LegalSection title="5. Kontaktaufnahme per E-Mail">
                  Wenn du uns per E-Mail kontaktierst, verarbeiten wir die von
                  dir mitgeteilten Daten, insbesondere deine E-Mail-Adresse und
                  den Inhalt deiner Nachricht, zur Bearbeitung deiner Anfrage.
                  Die E-Mail-Kommunikation läuft über <ContactMail />. Domain,
                  DNS und Mail werden über IONOS bereitgestellt.
                </LegalSection>

                <LegalSection title="6. Produktanfragen, Warenkorbanfragen und Checkout-Vorschau">
                  Wenn du eine Produktfrage, Warenkorbanfrage oder Anfrage über
                  die Checkout-Vorschau absendest, verarbeiten wir die von dir
                  eingegebenen Angaben wie Name, E-Mail-Adresse, Nachricht,
                  ausgewählte Produkte, Extras, Mengen, Preiszusammenfassungen
                  sowie bei der Checkout-Vorschau die angegebenen Adressdaten.
                  Diese Daten dienen ausschließlich dazu, deine unverbindliche
                  Anfrage zu bearbeiten. Die Checkout-Vorschau löst keine Zahlung
                  aus und stellt keinen direkten Kaufabschluss dar.
                </LegalSection>

                <LegalSection title="7. Warenkorb / localStorage">
                  Der Warenkorb wird lokal in deinem Browser über localStorage
                  gespeichert. Dadurch bleibt deine unverbindliche Auswahl auch
                  nach dem Neuladen der Seite erhalten. Diese Daten werden nicht
                  automatisch an uns übertragen. Eine Übermittlung erfolgt erst,
                  wenn du eine Warenkorbanfrage oder Checkout-Anfrage absendest.
                </LegalSection>

                <LegalSection title="8. Keine Analyse- oder Marketing-Tools">
                  Wir setzen derzeit kein Google Analytics, kein Meta Pixel,
                  keine Marketing-Cookies, keine Newsletter-Funktion, keine
                  Adress-Autovervollständigung/API und keine aktiven
                  Zahlungsanbieter ein.
                </LegalSection>

                <LegalSection title="9. Empfänger / technische Dienstleister">
                  Zur Bereitstellung und Verwaltung dieser Webseite können
                  technische Dienstleister eingesetzt werden. Dazu gehören Vercel
                  für Hosting und Website-Bereitstellung, Supabase für Datenbank,
                  Auth und Storage sowie IONOS für Domain, DNS und
                  E-Mail-Kommunikation.
                </LegalSection>

                <LegalSection title="10. Speicherdauer">
                  Wir speichern personenbezogene Daten nur so lange, wie es für
                  die Bearbeitung deiner Anfrage, die technische Bereitstellung
                  oder gesetzliche Aufbewahrungspflichten erforderlich ist. Nicht
                  mehr benötigte Daten werden gelöscht, soweit keine berechtigten
                  Gründe oder gesetzlichen Pflichten einer Löschung entgegenstehen.
                </LegalSection>

                <LegalSection title="11. Rechte der betroffenen Personen">
                  Du hast im Rahmen der gesetzlichen Voraussetzungen das Recht auf
                  Auskunft, Berichtigung, Löschung, Einschränkung der
                  Verarbeitung, Datenübertragbarkeit und Widerspruch gegen die
                  Verarbeitung deiner personenbezogenen Daten. Außerdem kannst du
                  dich bei einer zuständigen Datenschutzaufsichtsbehörde
                  beschweren.
                </LegalSection>

                <LegalSection title="12. SSL-/TLS-Verschlüsselung">
                  Diese Webseite nutzt eine SSL-/TLS-Verschlüsselung. Eine
                  verschlüsselte Verbindung erkennst du daran, dass die Adresse
                  der Webseite mit „https://“ beginnt.
                </LegalSection>

                <LegalSection title="13. Aktualität und Änderung dieser Datenschutzerklärung">
                  Diese Datenschutzerklärung gilt für den aktuellen technischen
                  Stand der Webseite. Wenn sich Funktionen, technische Dienste
                  oder rechtliche Anforderungen ändern, kann diese
                  Datenschutzerklärung angepasst werden.
                </LegalSection>
              </div>
            </>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
