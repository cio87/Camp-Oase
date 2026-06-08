import PublicHeader from "../components/PublicHeader";
import SiteFooter from "../components/SiteFooter";
import {
  legalContentStyle,
  legalTitleStyle,
  sectionStyle,
  siteStyle,
} from "../styles";

export default function ContactPage() {
  return (
    <div style={siteStyle}>
      <PublicHeader />

      <section style={sectionStyle}>
        <div style={legalContentStyle}>
          <h1 style={legalTitleStyle}>Kontakt</h1>
          <p>
            Hier entsteht bald ein eigener Kontaktbereich für Fragen, Wünsche
            und individuelle Ideen.
          </p>
          <p>
            Für konkrete Produktfragen kannst du bis dahin die Anfragefunktion
            auf der jeweiligen Produktdetailseite nutzen.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
