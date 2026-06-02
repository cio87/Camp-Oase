import { Link } from "react-router-dom";
import SiteFooter from "../components/SiteFooter";
import {
  headerStyle,
  legalContentStyle,
  legalTitleStyle,
  sectionStyle,
  siteStyle,
} from "../styles";

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
              <p>Dies ist ein Platzhalter für dein späteres Impressum.</p>
              <p>
                Hier kommen später Angaben wie Name, Anschrift, Kontakt,
                verantwortliche Person und weitere gesetzlich erforderliche
                Informationen hinein.
              </p>
              <p>
                Bitte vor Veröffentlichung rechtlich prüfen und vollständig
                ausfüllen.
              </p>
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

