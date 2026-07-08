import { useEffect } from "react";

const DEFAULT_TITLE = "Camp Oase";
const DEFAULT_DESCRIPTION =
  "Liebevoll gestaltete Camping-Produkte, Deko und Geschenkideen für Camper, Wohnwagen, Wohnmobil und Vanlife.";
const DEFAULT_IMAGE_PATH = "/logo.png";

function getDescriptionTag() {
  let tag = document.querySelector('meta[name="description"]');

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", "description");
    document.head.appendChild(tag);
  }

  return tag;
}

function getMetaTag(attribute, key) {
  let tag = document.querySelector(`meta[${attribute}="${key}"]`);

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }

  return tag;
}

function setMetaContent(attribute, key, content) {
  if (!content) return;

  getMetaTag(attribute, key).setAttribute("content", content);
}

function getCurrentUrl() {
  if (typeof window === "undefined") return "";

  return window.location.href;
}

function toAbsoluteUrl(value) {
  const url = String(value || "").trim();

  if (!url || typeof window === "undefined") return "";
  if (/^https?:\/\//i.test(url)) return url;

  return new URL(url, window.location.origin).href;
}

function getJsonLdTag(id) {
  const scriptId = `json-ld-${id}`;
  let tag = document.getElementById(scriptId);

  if (!tag) {
    tag = document.createElement("script");
    tag.id = scriptId;
    tag.type = "application/ld+json";
    document.head.appendChild(tag);
  }

  return tag;
}

function stripBasicMarkdown(value) {
  return String(value || "")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*]\([^)]*\)/g, (match) =>
      match.replace(/^\[|\]\([^)]*\)$/g, "")
    )
    .replace(/[`*_>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function createMetaDescription(value, fallback = DEFAULT_DESCRIPTION) {
  const cleanText = stripBasicMarkdown(value) || fallback;

  if (cleanText.length <= 160) return cleanText;

  const shortened = cleanText.slice(0, 160);
  const lastSpace = shortened.lastIndexOf(" ");

  return (lastSpace > 120 ? shortened.slice(0, lastSpace) : shortened).trim();
}

export function createAbsoluteUrl(value) {
  return toAbsoluteUrl(value);
}

export function setJsonLd(id, data) {
  if (typeof document === "undefined" || !id || !data) return;

  getJsonLdTag(id).textContent = JSON.stringify(data);
}

export function removeJsonLd(id) {
  if (typeof document === "undefined" || !id) return;

  document.getElementById(`json-ld-${id}`)?.remove();
}

export function setPageSeo({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  type = "website",
  image = DEFAULT_IMAGE_PATH,
  url = getCurrentUrl(),
  social = true,
}) {
  if (typeof document === "undefined") return;

  const safeTitle = title || DEFAULT_TITLE;
  const safeDescription = description || DEFAULT_DESCRIPTION;
  const absoluteImage = toAbsoluteUrl(image);

  document.title = safeTitle;
  getDescriptionTag().setAttribute("content", safeDescription);

  if (!social) return;

  setMetaContent("property", "og:title", safeTitle);
  setMetaContent("property", "og:description", safeDescription);
  setMetaContent("property", "og:type", type || "website");
  setMetaContent("property", "og:url", url || getCurrentUrl());
  setMetaContent("name", "twitter:card", "summary_large_image");
  setMetaContent("name", "twitter:title", safeTitle);
  setMetaContent("name", "twitter:description", safeDescription);

  if (absoluteImage) {
    setMetaContent("property", "og:image", absoluteImage);
    setMetaContent("name", "twitter:image", absoluteImage);
  }
}

export function usePageSeo(title, description, options = {}) {
  useEffect(() => {
    setPageSeo({ title, description, ...options });
  }, [title, description, options.type, options.image, options.url, options.social]);
}

export function useJsonLd(id, data) {
  const serializedData = data ? JSON.stringify(data) : "";

  useEffect(() => {
    if (!serializedData) {
      removeJsonLd(id);
      return undefined;
    }

    setJsonLd(id, JSON.parse(serializedData));

    return () => removeJsonLd(id);
  }, [id, serializedData]);
}
