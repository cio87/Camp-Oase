import { Link } from "react-router-dom";
import PublicHeader from "../components/PublicHeader";
import SiteFooter from "../components/SiteFooter";
import { usePageSeo } from "../utils/seo";
import {
  aboutActionStyle,
  aboutCardGridStyle,
  aboutCardIconStyle,
  aboutCardStyle,
  aboutCardTitleStyle,
  aboutHeroImageStyle,
  aboutHeroMediaStyle,
  aboutHeadingStyle,
  aboutIntroStyle,
  aboutKickerStyle,
  aboutNoteStyle,
  aboutPageStyle,
  aboutStoryMessageStyle,
  sectionStyle,
  siteStyle,
} from "../styles";

const aboutCards = [
  { icon: "🏷️", title: "Für dich personalisiert", text: "Motive, Varianten und Extras passend zu deiner Idee." },
  { icon: "🚐", title: "Für echte Campingmomente", text: "Kleine Lieblingsstücke für unterwegs und den Stellplatz." },
  { icon: "✨", title: "Mit Blick fürs Detail", text: "Sorgfältig gestaltet, abgestimmt und persönlich umgesetzt." },
];

export default function AboutPage() {
  usePageSeo(
    "Über uns | Camp Oase",
    "Erfahre mehr über Camp Oase, liebevoll gestaltete Camping-Produkte und persönliche Geschenkideen für Camper."
  );

  return (
    <div style={siteStyle}>
      <PublicHeader />
      <section style={sectionStyle}>
        <div style={aboutPageStyle}>
          <p style={aboutKickerStyle}>Willkommen bei Camp Oase</p>
          <h1 style={aboutHeadingStyle}>Kleine Dinge. Persönlich für dich. Gemacht für unterwegs.</h1>
          <p style={aboutIntroStyle}>
            Camp Oase verbindet Campingliebe mit persönlichen Ideen, die deinen Camper,
            deinen Lieblingsplatz oder dein Geschenk besonders machen.
          </p>

          <div style={aboutHeroMediaStyle}>
            <img
              src="/images/hero-camping.png"
              alt="Gemütlicher Campingplatz am See bei Sonnenuntergang"
              style={aboutHeroImageStyle}
            />
          </div>

          <p style={aboutStoryMessageStyle}>
            Camp Oase ist aus der Freude entstanden, Campingmomente persönlicher zu
            machen. Aus kleinen Ideen werden Produkte, die zu deinem Wohnwagen,
            Wohnmobil oder einem besonderen Menschen passen.
          </p>

          <div style={aboutCardGridStyle}>
            {aboutCards.map((card) => (
              <article key={card.title} style={aboutCardStyle}>
                <span style={aboutCardIconStyle} aria-hidden="true">
                  {card.icon}
                </span>
                <h2 style={aboutCardTitleStyle}>{card.title}</h2>
                <p>{card.text}</p>
              </article>
            ))}
          </div>

          <div style={aboutNoteStyle}>
            Camp Oase wächst mit jeder neuen Idee – und vielleicht entsteht das nächste
            Lieblingsstück schon aus deiner.
          </div>

          <Link to="/#produkte" style={aboutActionStyle}>Produkte entdecken</Link>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}