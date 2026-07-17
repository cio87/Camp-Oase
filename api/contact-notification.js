import { getSmtpTransport } from "./_mail.js";

// Required Vercel environment variables:
// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
// Optional: CONTACT_RECEIVER_EMAIL (defaults to service@camp-oase.de)

function sendJson(response, status, data) {
  response.status(status).json(data);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return sendJson(response, 405, { error: "Method not allowed" });
  }

  const { name, email, message } = request.body || {};
  const cleanName = String(name || "").trim();
  const cleanEmail = String(email || "").trim();
  const cleanMessage = String(message || "").trim();

  if (!cleanName || !isValidEmail(cleanEmail) || !cleanMessage) {
    return sendJson(response, 400, {
      error: "Name, E-Mail und Nachricht sind erforderlich.",
    });
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const receiverEmail =
    process.env.CONTACT_RECEIVER_EMAIL || "service@camp-oase.de";

  if (!smtpHost || !smtpUser || !smtpPass) {
    return sendJson(response, 500, {
      error:
        "SMTP ist noch nicht vollständig konfiguriert. Bitte SMTP_HOST, SMTP_PORT, SMTP_USER und SMTP_PASS setzen.",
    });
  }

  const { transporter } = getSmtpTransport();

  const submittedAt = new Date().toLocaleString("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Berlin",
  });

  await transporter.sendMail({
    from: smtpUser,
    to: receiverEmail,
    replyTo: cleanEmail,
    subject: "Neue Kontaktanfrage über Camp Oase",
    text: [
      "Neue Kontaktanfrage über Camp Oase",
      "",
      `Name: ${cleanName}`,
      `E-Mail: ${cleanEmail}`,
      `Datum/Uhrzeit: ${submittedAt}`,
      "",
      "Nachricht:",
      cleanMessage,
    ].join("\n"),
  });

  return sendJson(response, 200, { ok: true });
}
