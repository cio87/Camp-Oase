function renderInlineMarkdown(text) {
  return String(text || "")
    .split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }

      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      }

      return part;
    });
}

const paragraphStyle = {
  margin: "0 0 14px",
};

const listStyle = {
  margin: "8px 0 16px",
  paddingLeft: "24px",
  listStyleType: "disc",
  listStylePosition: "outside",
};

const listItemStyle = {
  margin: "6px 0",
  paddingLeft: "2px",
};

export function MarkdownText({ text, style }) {
  const blocks = [];
  let paragraph = [];
  let list = [];

  function flushParagraph() {
    if (paragraph.length === 0) return;

    blocks.push({
      type: "paragraph",
      text: paragraph.join(" "),
    });
    paragraph = [];
  }

  function flushList() {
    if (list.length === 0) return;

    blocks.push({
      type: "list",
      items: list,
    });
    list = [];
  }

  String(text || "")
    .split(/\r?\n/)
    .forEach((line) => {
      const trimmed = line.trim();

      if (!trimmed) {
        flushParagraph();
        flushList();
        return;
      }

      if (trimmed.startsWith("- ")) {
        flushParagraph();
        list.push(trimmed.slice(2).trim());
        return;
      }

      flushList();
      paragraph.push(trimmed);
    });

  flushParagraph();
  flushList();

  return (
    <div style={style}>
      {blocks.map((block, index) => {
        if (block.type === "list") {
          return (
            <ul key={index} style={listStyle}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} style={listItemStyle}>
                  {renderInlineMarkdown(item)}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={index} style={paragraphStyle}>
            {renderInlineMarkdown(block.text)}
          </p>
        );
      })}
    </div>
  );
}

export function stripMarkdown(text) {
  return String(text || "")
    .replace(/^\s*-\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\r?\n+/g, " ")
    .trim();
}
