import { useEffect } from "react";

const DEFAULT_TITLE = "Camp Oase";
const DEFAULT_DESCRIPTION =
  "Liebevoll gestaltete Camping-Produkte, Deko und Geschenkideen für Camper, Wohnwagen, Wohnmobil und Vanlife.";

function getDescriptionTag() {
  let tag = document.querySelector('meta[name="description"]');

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", "description");
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

export function setPageSeo({ title = DEFAULT_TITLE, description = DEFAULT_DESCRIPTION }) {
  if (typeof document === "undefined") return;

  document.title = title;
  getDescriptionTag().setAttribute("content", description || DEFAULT_DESCRIPTION);
}

export function usePageSeo(title, description) {
  useEffect(() => {
    setPageSeo({ title, description });
  }, [title, description]);
}
