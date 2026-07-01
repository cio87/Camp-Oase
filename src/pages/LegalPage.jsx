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
                  E-Mail:{" "}
                  <a href="mailto:service@camp-oase.de" style={legalMailLinkStyle}>
                    service@camp-oase.de
                  </a>
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
              <p>
                Dies ist ein Platzhalter für deine spätere Datenschutzerklärung.
              </p>
              <p>
                Hier erklären wir später, welche personenbezogenen Daten über
                das Anfrageformular verarbeitet werden, wofür sie genutzt werden
                und welche Rechte Besucher haben.
              </p>
              <p>
                Bitte vor Veröffentlichung rechtlich prüfen und vollständig
                ausfüllen.
              </p>
            </>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
