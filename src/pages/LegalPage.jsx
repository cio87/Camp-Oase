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

const legalListStyle = {
  ...legalTextStyle,
  margin: "10px 0 0",
  paddingLeft: "22px",
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

  usePageSeo(
    isImpressum ? "Impressum | Camp Oase" : "Datenschutz | Camp Oase",
    isImpressum
      ? "Impressum und Anbieterangaben von Camp Oase."
      : "Datenschutzerklärung von Camp Oase mit Informationen zur Verarbeitung personenbezogener Daten."
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
                Website
              </p>

              <div style={legalSectionGridStyle}>
                <LegalSection title="1. Verantwortlicher">
                  Verantwortlich für die Datenverarbeitung auf dieser Website ist:
                  <br />
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
                </LegalSection>

                <LegalSection title="2. Allgemeine Hinweise zur Datenverarbeitung">
                  <p style={legalTextStyle}>
                    Wir verarbeiten personenbezogene Daten nur, soweit dies zur
                    Bereitstellung dieser Website, zur Bearbeitung von Anfragen
                    oder zur technischen Sicherheit erforderlich ist.
                    Personenbezogene Daten sind alle Informationen, mit denen eine
                    Person direkt oder indirekt identifiziert werden kann.
                  </p>
                  <p style={{ ...legalTextStyle, marginTop: "12px" }}>
                    Diese Website dient aktuell der Präsentation von Produkten und
                    der unverbindlichen Anfrage von Produkten oder
                    Warenkorbinhalten. Es findet derzeit kein direkter
                    Kaufabschluss und keine Online-Zahlung über die Website statt.
                  </p>
                </LegalSection>

                <LegalSection title="3. Hosting und Server-Logfiles">
                  Diese Website wird über Vercel bereitgestellt. Beim Aufruf der
                  Website können technisch notwendige Daten verarbeitet werden, zum
                  Beispiel:
                  <ul style={legalListStyle}>
                    <li>IP-Adresse</li>
                    <li>Datum und Uhrzeit des Zugriffs</li>
                    <li>aufgerufene Seiten</li>
                    <li>Browsertyp und Betriebssystem</li>
                    <li>Referrer-URL</li>
                    <li>technische Verbindungsdaten</li>
                  </ul>
                  <p style={{ ...legalTextStyle, marginTop: "12px" }}>
                    Diese Daten sind erforderlich, um die Website sicher und
                    zuverlässig auszuliefern. Die Verarbeitung erfolgt auf
                    Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes
                    Interesse liegt in der sicheren, stabilen und effizienten
                    Bereitstellung unserer Website.
                  </p>
                </LegalSection>

                <LegalSection title="4. Nutzung von Supabase">
                  Für Datenbankfunktionen, Authentifizierung im Adminbereich und
                  die Speicherung von Produktbildern nutzen wir Supabase.
                  <br />
                  <br />
                  Über Supabase können insbesondere folgende Daten verarbeitet
                  werden:
                  <ul style={legalListStyle}>
                    <li>Produktdaten</li>
                    <li>Produktbilder</li>
                    <li>Anfragen über Produkt- und Warenkorbanfragen</li>
                    <li>Kontaktanfragen über das Kontaktformular</li>
                    <li>Name, E-Mail-Adresse und Nachrichteninhalt bei Anfragen</li>
                    <li>
                      Adressdaten, sofern diese in der Checkout-Vorschau für eine
                      unverbindliche Anfrage eingegeben werden
                    </li>
                    <li>technische Authentifizierungsdaten für den Adminbereich</li>
                  </ul>
                  <p style={{ ...legalTextStyle, marginTop: "12px" }}>
                    Die Verarbeitung erfolgt, soweit sie zur Bearbeitung von
                    Anfragen erforderlich ist, auf Grundlage von Art. 6 Abs. 1
                    lit. b DSGVO. Soweit die Verarbeitung zur technischen
                    Bereitstellung und Verwaltung der Website erforderlich ist,
                    erfolgt sie auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
                  </p>
                </LegalSection>

                <LegalSection title="5. Kontaktaufnahme per E-Mail oder Kontaktformular">
                  <p style={legalTextStyle}>
                    Wenn du uns per E-Mail oder über das Kontaktformular
                    kontaktierst, verarbeiten wir die von dir übermittelten
                    Daten, zum Beispiel deinen Namen, deine E-Mail-Adresse und
                    den Inhalt deiner Nachricht. Diese Daten verwenden wir
                    ausschließlich zur Bearbeitung deiner Anfrage.
                  </p>
                  <p style={{ ...legalTextStyle, marginTop: "12px" }}>
                    Kontaktanfragen über das Formular werden in Supabase
                    gespeichert. Eine Weitergabe an Dritte erfolgt nicht, außer
                    soweit dies technisch zur Bereitstellung der Website und
                    Dienste erforderlich ist.
                  </p>
                  <p style={{ ...legalTextStyle, marginTop: "12px" }}>
                    Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit.
                    b DSGVO, sofern deine Anfrage mit einer möglichen Bestellung
                    oder Leistung zusammenhängt. In allen anderen Fällen erfolgt
                    die Verarbeitung auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
                  </p>
                </LegalSection>

                <LegalSection title="6. Produktanfragen, Warenkorbanfragen und Checkout-Vorschau">
                  Auf unserer Website kannst du Produkte oder deinen Warenkorb
                  unverbindlich anfragen. Dabei können je nach Formular folgende
                  Daten verarbeitet werden:
                  <ul style={legalListStyle}>
                    <li>Vorname und Nachname</li>
                    <li>E-Mail-Adresse</li>
                    <li>Telefonnummer, falls freiwillig angegeben</li>
                    <li>Lieferadresse, falls in der Checkout-Vorschau angegeben</li>
                    <li>Nachricht oder Personalisierungswunsch</li>
                    <li>angefragte Produkte</li>
                    <li>ausgewählte Extras</li>
                    <li>Mengen und angezeigte Preise</li>
                    <li>Gesamtbetrag der Anfrage</li>
                  </ul>
                  <p style={{ ...legalTextStyle, marginTop: "12px" }}>
                    Diese Daten werden genutzt, um deine Anfrage zu bearbeiten
                    und mit dir Kontakt aufzunehmen. Über die Website kommt
                    aktuell kein direkter Kaufvertrag zustande und es wird keine
                    Online-Zahlung ausgelöst.
                  </p>
                  <p style={{ ...legalTextStyle, marginTop: "12px" }}>
                    Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit.
                    b DSGVO, da deine Anfrage auf eine mögliche spätere
                    Bestellung oder individuelle Abstimmung gerichtet ist.
                  </p>
                </LegalSection>

                <LegalSection title="7. Warenkorb und localStorage">
                  Damit dein Warenkorb beim Wechsel zwischen Seiten erhalten
                  bleibt, speichert die Website Warenkorbdaten lokal in deinem
                  Browser. Dafür wird localStorage verwendet.
                  <br />
                  <br />
                  Dabei können zum Beispiel folgende Daten lokal auf deinem Gerät
                  gespeichert werden:
                  <ul style={legalListStyle}>
                    <li>Produkt-ID</li>
                    <li>Produktname</li>
                    <li>Menge</li>
                    <li>ausgewählte Extras</li>
                    <li>Preisangaben</li>
                    <li>Produktstatus</li>
                  </ul>
                  <p style={{ ...legalTextStyle, marginTop: "12px" }}>
                    Diese Daten werden nicht automatisch an uns übertragen. Eine
                    Übertragung erfolgt erst, wenn du eine Warenkorbanfrage oder
                    Checkout-Anfrage absendest.
                  </p>
                  <p style={{ ...legalTextStyle, marginTop: "12px" }}>
                    Du kannst die gespeicherten Daten löschen, indem du den
                    Warenkorb leerst oder die Browserdaten löschst.
                  </p>
                </LegalSection>

                <LegalSection title="8. PayPal-Vorbereitung">
                  PayPal ist technisch für eine spätere Zahlungsfunktion
                  vorbereitet, aber aktuell nicht live aktiv. Solange die
                  Zahlungsfunktion nicht aktiviert und vollständig eingerichtet
                  ist, werden über PayPal keine Zahlungen ausgelöst und keine
                  Zahlungsdaten über diese Website verarbeitet.
                  <br />
                  <br />
                  Sobald PayPal zukünftig aktiv genutzt wird, wird diese
                  Datenschutzerklärung entsprechend ergänzt.
                </LegalSection>

                <LegalSection title="9. Keine Analyse- oder Marketing-Tools">
                  Wir verwenden aktuell keine Analyse- oder Marketing-Tools wie
                  Google Analytics, Meta Pixel oder vergleichbare Trackingdienste.
                  <br />
                  <br />
                  Es werden keine Marketing-Cookies gesetzt und es findet kein
                  werbliches Nutzertracking statt.
                </LegalSection>

                <LegalSection title="10. Cookies und technisch notwendige Speicherung">
                  Aktuell verwenden wir keine Marketing-Cookies. Für technisch
                  notwendige Funktionen können jedoch browserseitige
                  Speichertechniken wie localStorage genutzt werden, insbesondere
                  für den Warenkorb.
                  <br />
                  <br />
                  Diese Speicherung dient der technischen Funktion der Website und
                  der Nutzerfreundlichkeit.
                </LegalSection>

                <LegalSection title="11. Empfänger und technische Dienstleister">
                  Zur Bereitstellung der Website und zur Bearbeitung von Anfragen
                  können Daten durch technische Dienstleister verarbeitet werden,
                  insbesondere:
                  <ul style={legalListStyle}>
                    <li>Vercel für Hosting und Bereitstellung der Website</li>
                    <li>Supabase für Datenbank, Authentifizierung und Produktbildspeicherung</li>
                    <li>IONOS für Domain, DNS und E-Mail-Kommunikation</li>
                  </ul>
                  <p style={{ ...legalTextStyle, marginTop: "12px" }}>
                    Eine Weitergabe personenbezogener Daten erfolgt nur, soweit
                    dies zur Bereitstellung der Website, zur Bearbeitung deiner
                    Anfrage oder aufgrund gesetzlicher Pflichten erforderlich ist.
                  </p>
                </LegalSection>

                <LegalSection title="12. Speicherdauer">
                  Personenbezogene Daten werden nur so lange gespeichert, wie es
                  für den jeweiligen Zweck erforderlich ist. Anfragen werden
                  gespeichert, solange dies zur Bearbeitung, Nachvollziehbarkeit
                  oder aufgrund gesetzlicher Aufbewahrungspflichten erforderlich
                  ist.
                  <br />
                  <br />
                  Wenn eine Anfrage nicht mehr benötigt wird und keine
                  gesetzlichen Aufbewahrungspflichten entgegenstehen, wird sie
                  gelöscht.
                </LegalSection>

                <LegalSection title="13. Deine Rechte">
                  Du hast im Rahmen der gesetzlichen Voraussetzungen insbesondere
                  folgende Rechte:
                  <ul style={legalListStyle}>
                    <li>Recht auf Auskunft über gespeicherte personenbezogene Daten</li>
                    <li>Recht auf Berichtigung unrichtiger Daten</li>
                    <li>Recht auf Löschung</li>
                    <li>Recht auf Einschränkung der Verarbeitung</li>
                    <li>Recht auf Datenübertragbarkeit</li>
                    <li>Recht auf Widerspruch gegen bestimmte Verarbeitungen</li>
                    <li>Recht auf Beschwerde bei einer Datenschutzaufsichtsbehörde</li>
                  </ul>
                  <p style={{ ...legalTextStyle, marginTop: "12px" }}>
                    Zur Ausübung deiner Rechte kannst du dich jederzeit an{" "}
                    <ContactMail /> wenden.
                  </p>
                </LegalSection>

                <LegalSection title="14. SSL-/TLS-Verschlüsselung">
                  Diese Website nutzt aus Sicherheitsgründen eine
                  SSL-/TLS-Verschlüsselung. Eine verschlüsselte Verbindung
                  erkennst du an „https://“ in der Adresszeile deines Browsers.
                </LegalSection>

                <LegalSection title="15. Aktualität und Änderung dieser Datenschutzerklärung">
                  Wir behalten uns vor, diese Datenschutzerklärung anzupassen,
                  wenn sich technische Funktionen, eingesetzte Dienste oder
                  rechtliche Anforderungen ändern.
                  <br />
                  <br />
                  Stand: Juli 2026
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
