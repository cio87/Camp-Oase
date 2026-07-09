import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

function sendJson(response, status, data) {
  response.status(status).json(data);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildCustomerText(message) {
  const cleanMessage = String(message || "").trim();
  const withoutContactFooter = cleanMessage
    .replace(/(\n|\s)*(service@camp-oase\.de|www\.camp-oase\.de)\s*$/gi, "")
    .replace(/(\n|\s)*(service@camp-oase\.de|www\.camp-oase\.de)\s*$/gi, "")
    .trim();
  const hasCampOaseSignature = /(^|\n)\s*Camp Oase\s*$/i.test(
    withoutContactFooter
  );
  const signedMessage = hasCampOaseSignature
    ? withoutContactFooter
    : [withoutContactFooter, "", "Viele Grüße", "Camp Oase"].join("\n");

  return signedMessage;
}

function buildPlainTextMail(messageText) {
  return [
    messageText,
    "",
    "--",
    "Camp Oase",
    "service@camp-oase.de",
    "www.camp-oase.de",
  ].join("\n");
}

function buildCustomerHtml(text) {
  const escapedText = escapeHtml(text).replace(/\n/g, "<br />");

  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Camp Oase</title>
  </head>
  <body style="margin:0; padding:0; background:#f5f1e8; color:#2f3a34; font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; margin:0; padding:0; background:#f5f1e8;">
      <tr>
        <td align="center" style="padding:28px 14px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; max-width:640px; border-collapse:separate; background:#fffdf8; border:1px solid #d8e1d3; border-radius:22px; overflow:hidden;">
            <tr>
              <td style="padding:22px 24px; background:#eef3ea; border-bottom:1px solid #d8e1d3;">
                <div style="font-size:22px; line-height:1.2; color:#556b5d; font-weight:700; letter-spacing:0.2px;">
                  Camp Oase
                </div>
                <div style="margin-top:6px; font-size:13px; line-height:1.4; color:#6f856f;">
                  Liebevolle Camping-Produkte & persönliche Geschenkideen
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:26px 24px; background:#fffdf8; color:#2f3a34; font-size:16px; line-height:1.72;">
                ${escapedText}
              </td>
            </tr>
            <tr>
              <td style="padding:18px 24px; background:#f7f2e7; border-top:1px solid #d8e1d3; color:#556b5d; font-size:14px; line-height:1.65;">
                <strong style="color:#556b5d; font-weight:700;">Camp Oase</strong><br />
                <a href="mailto:service@camp-oase.de" style="color:#6f856f; text-decoration:none;">service@camp-oase.de</a><br />
                <a href="https://www.camp-oase.de" style="color:#6f856f; text-decoration:none;">www.camp-oase.de</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function getSupabaseConfig() {
  return {
    url: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    anonKey:
      process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY,
  };
}

function isAdminUser(user) {
  const receiverEmail =
    process.env.CONTACT_RECEIVER_EMAIL || "service@camp-oase.de";
  const userEmail = String(user?.email || "").toLowerCase();
  const allowedEmail = String(receiverEmail || "").toLowerCase();
  const appRole = String(user?.app_metadata?.role || "").toLowerCase();
  const userRole = String(user?.user_metadata?.role || "").toLowerCase();

  return (
    appRole === "admin" ||
    userRole === "admin" ||
    (allowedEmail && userEmail === allowedEmail)
  );
}

async function getAuthenticatedUser(request) {
  const authHeader = request.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "";

  if (!token) return { error: "missing_token" };

  const { url, anonKey } = getSupabaseConfig();

  if (!url || !anonKey) return { error: "missing_supabase_config" };

  const supabase = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) return { error: "invalid_token" };
  if (!isAdminUser(data.user)) return { error: "not_admin" };

  return { user: data.user };
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return sendJson(response, 405, { error: "Method not allowed" });
  }

  const authResult = await getAuthenticatedUser(request);

  if (authResult.error === "missing_supabase_config") {
    return sendJson(response, 500, {
      error: "Admin-Pruefung ist serverseitig noch nicht konfiguriert.",
    });
  }

  if (authResult.error) {
    return sendJson(response, 401, {
      error: "Nicht autorisiert.",
    });
  }

  const { to, subject, message } = request.body || {};
  const cleanTo = String(to || "").trim();
  const cleanSubject = String(subject || "").trim();
  const cleanMessage = String(message || "").trim();

  if (!isValidEmail(cleanTo)) {
    return sendJson(response, 400, { error: "Empfaenger-Adresse ist ungueltig." });
  }

  if (!cleanSubject) {
    return sendJson(response, 400, { error: "Betreff ist erforderlich." });
  }

  if (!cleanMessage) {
    return sendJson(response, 400, { error: "Nachricht ist erforderlich." });
  }

  if (cleanMessage.length > 5000) {
    return sendJson(response, 400, {
      error: "Nachricht ist zu lang. Maximal 5000 Zeichen.",
    });
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const replyAddress =
    process.env.CONTACT_RECEIVER_EMAIL || smtpUser || "service@camp-oase.de";

  if (!smtpHost || !smtpUser || !smtpPass) {
    return sendJson(response, 500, {
      error: "Mailversand ist serverseitig noch nicht vollstaendig konfiguriert.",
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const customerText = buildCustomerText(cleanMessage);

    await transporter.sendMail({
      from: `"Camp Oase" <${smtpUser}>`,
      sender: smtpUser,
      to: cleanTo,
      replyTo: replyAddress,
      subject: cleanSubject,
      text: buildPlainTextMail(customerText),
      html: buildCustomerHtml(customerText),
    });

    return sendJson(response, 200, { ok: true });
  } catch (_error) {
    return sendJson(response, 500, {
      error: "Antwort konnte nicht gesendet werden.",
    });
  }
}
