import PublicHeader from "../components/PublicHeader";
import SiteFooter from "../components/SiteFooter";
import {
  legalContentStyle,
  legalTitleStyle,
  sectionStyle,
  siteStyle,
} from "../styles";

export default function AboutPage() {
  return (
    <div style={siteStyle}>
      <PublicHeader />

      <section style={sectionStyle}>
        <div style={legalContentStyle}>
          <h1 style={legalTitleStyle}>Über uns</h1>
          <p>
            Hier entsteht bald ein kurzer Einblick in Camp Oase, unsere Ideen
            und die Menschen hinter den Produkten.
          </p>
          <p>
            Bis dahin findest du auf der Startseite unsere aktuelle
            Produktauswahl.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
