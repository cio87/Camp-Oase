import { useState } from "react";
import { Link } from "react-router-dom";
import PublicHeader from "../components/PublicHeader";
import SiteFooter from "../components/SiteFooter";
import { supabase } from "../supabaseClient";
import {
  aboutCardGridStyle,
  aboutCardIconStyle,
  aboutCardStyle,
  aboutIntroStyle,
  aboutNoteStyle,
  aboutPageStyle,
  aboutStoryStyle,
  buttonStyle,
  contactInfoStyle,
  errorBoxStyle,
  inputStyle,
  legalTitleStyle,
  sectionStyle,
  siteStyle,
  successBoxStyle,
} from "../styles";

const contactTopics = [
  {
    icon: "🛒",
    title: "Produktfragen",
    text: "Nutze am besten direkt die Produktseite, damit wir sofort wissen, worum es geht.",
  },
  {
    icon: "✨",
    title: "Personalisierung & Extras",
    text: "Wenn du dir eine besondere Variante wünschst, schreib uns gern mit ein paar Details.",
  },
  {
    icon: "💡",
    title: "Individuelle Ideen",
    text: "Manche Ideen entstehen erst unterwegs. Wir schauen gern, was möglich ist.",
  },
];

const emptyContactForm = {
  name: "",
  email: "",
  message: "",
};

const formBoxStyle = {
  background: "rgba(255,255,255,0.78)",
  border: "1px solid #eee7da",
  borderRadius: "20px",
  padding: "20px",
  margin: "24px 0",
};

const labelStyle = {
  display: "block",
  color: "#435749",
  fontWeight: "bold",
  marginTop: "10px",
};

const fieldErrorStyle = {
  color: "#9b4d4d",
  fontSize: "13px",
  fontWeight: "bold",
  margin: "-4px 0 8px",
};

export default function ContactPage() {
  const [form, setForm] = useState(emptyContactForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  function updateField(field, value) {
    setForm({ ...form, [field]: value });
    setErrors({ ...errors, [field]: "" });
    setStatus("");
  }

  function validateForm() {
    const nextErrors = {};

    if (form.name.trim().length < 2) {
      nextErrors.name = "Bitte gib deinen Namen ein.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Bitte gib eine gültige E-Mail-Adresse ein.";
    }

    if (form.message.trim().length < 10) {
      nextErrors.message = "Bitte schreibe mindestens 10 Zeichen.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function submitContactMessage(event) {
    event.preventDefault();

    if (!validateForm()) {
      setStatus("validation");
      return;
    }

    setSending(true);
    setStatus("");
    const contactPayload = {
      name: form.name.trim(),
      email: form.email.trim(),
      message: form.message.trim(),
    };

    const { error } = await supabase.from("contact_messages").insert([
      {
        ...contactPayload,
        status: "neu",
      },
    ]);

    setSending(false);

    if (error) {
      console.log(error);
      setStatus("error");
      return;
    }

    try {
      const response = await fetch("/api/contact-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactPayload),
      });

      if (!response.ok) {
        console.warn(
          "Kontaktanfrage gespeichert, aber E-Mail-Benachrichtigung fehlgeschlagen."
        );
      }
    } catch {
      console.warn(
        "Kontaktanfrage gespeichert, aber E-Mail-Benachrichtigung fehlgeschlagen."
      );
    }

    setForm(emptyContactForm);
    setStatus("success");
  }

  return (
    <div style={siteStyle}>
      <PublicHeader />

      <section style={sectionStyle}>
        <div style={aboutPageStyle}>
          <p style={{ color: "#7f9b76", fontWeight: "bold", marginTop: 0 }}>
            Schreib uns
          </p>

          <h1 style={legalTitleStyle}>Kontakt zu Camp Oase</h1>

          <p style={aboutIntroStyle}>
            Du hast eine Frage zu einem Produkt, einer Personalisierung oder
            einer Idee? Dann melde dich gern bei uns.
          </p>

          <div style={aboutStoryStyle}>
            Für konkrete Produktfragen nutze am besten direkt auf der
            Produktseite den Button "Frage zum Produkt stellen". So wissen wir
            sofort, um welches Produkt es geht.
          </div>

          <div style={contactInfoStyle}>
            <span>E-Mail</span>
            <a
              href="mailto:service@camp-oase.de"
              style={{
                display: "block",
                color: "#556b5d",
                fontWeight: "bold",
                fontSize: "18px",
                textDecoration: "none",
                overflowWrap: "anywhere",
              }}
            >
              service@camp-oase.de
            </a>
            <p>Wir melden uns so schnell wie möglich zurück.</p>
          </div>

          <form onSubmit={submitContactMessage} style={formBoxStyle} noValidate>
            <h2 style={{ marginTop: 0, color: "#435749" }}>
              Allgemeine Kontaktanfrage
            </h2>
            <p style={{ color: "#667", lineHeight: "1.6" }}>
              Für konkrete Produktfragen ist die Produktseite ideal. Für alles
              andere kannst du uns hier direkt schreiben.
            </p>

            {status === "validation" && (
              <div style={errorBoxStyle}>Bitte prüfe die markierten Felder.</div>
            )}

            {status === "success" && (
              <div style={successBoxStyle}>
                Danke für deine Nachricht. Wir melden uns so schnell wie möglich
                zurück.
              </div>
            )}

            {status === "error" && (
              <div style={errorBoxStyle}>
                Deine Nachricht konnte leider nicht gesendet werden. Bitte
                versuche es später erneut.
              </div>
            )}

            <label style={labelStyle}>Name</label>
            <input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              style={inputStyle}
            />
            {errors.name && <p style={fieldErrorStyle}>{errors.name}</p>}

            <label style={labelStyle}>E-Mail-Adresse</label>
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              style={inputStyle}
            />
            {errors.email && <p style={fieldErrorStyle}>{errors.email}</p>}

            <label style={labelStyle}>Nachricht</label>
            <textarea
              value={form.message}
              onChange={(event) => updateField("message", event.target.value)}
              style={{ ...inputStyle, minHeight: "140px" }}
            />
            {errors.message && <p style={fieldErrorStyle}>{errors.message}</p>}

            <button type="submit" disabled={sending} style={buttonStyle}>
              {sending ? "Wird gesendet..." : "Nachricht senden"}
            </button>
          </form>

          <div style={aboutCardGridStyle}>
            {contactTopics.map((topic) => (
              <div key={topic.title} style={aboutCardStyle}>
                <span style={aboutCardIconStyle}>{topic.icon}</span>
                <h2>{topic.title}</h2>
                <p>{topic.text}</p>
              </div>
            ))}
          </div>

          <div style={aboutNoteStyle}>
            Camp Oase wächst Schritt für Schritt – daher läuft vieles aktuell
            noch persönlich und direkt.
          </div>

          <Link
            to="/#produkte"
            style={{
              ...buttonStyle,
              display: "inline-block",
              textDecoration: "none",
              marginTop: "24px",
            }}
          >
            Zur Produktübersicht
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
