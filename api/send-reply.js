import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

function sendJson(response, status, data) {
  response.status(status).json(data);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
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

  const { to, subject, message, inquiryId, customerName } = request.body || {};
  const cleanTo = String(to || "").trim();
  const cleanSubject = String(subject || "").trim();
  const cleanMessage = String(message || "").trim();
  const cleanInquiryId = String(inquiryId || "").trim();
  const cleanCustomerName = String(customerName || "").trim();

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

    const internalFooter = [
      "",
      "",
      "---",
      cleanInquiryId ? `Referenz Anfrage-ID: ${cleanInquiryId}` : "",
      cleanCustomerName ? `Kunde: ${cleanCustomerName}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    await transporter.sendMail({
      from: smtpUser,
      to: cleanTo,
      replyTo: replyAddress,
      subject: cleanSubject,
      text: cleanMessage + internalFooter,
    });

    return sendJson(response, 200, { ok: true });
  } catch (_error) {
    return sendJson(response, 500, {
      error: "Antwort konnte nicht gesendet werden.",
    });
  }
}
