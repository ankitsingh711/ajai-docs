/**
 * Converts plain text or lightweight Markdown into a TipTap-compatible
 * ProseMirror JSON document. This is intentionally a small, dependency-free
 * converter rather than a full Markdown parser — it covers the cases the
 * assignment cares about (headings, lists, paragraphs) without pulling in
 * a heavy library for a one-way import feature.
 */

type Node = Record<string, unknown>;

function textNode(text: string): Node {
  return { type: "text", text };
}

function paragraph(text: string): Node {
  return text.trim() === ""
    ? { type: "paragraph" }
    : { type: "paragraph", content: [textNode(text)] };
}

function heading(level: number, text: string): Node {
  return { type: "heading", attrs: { level }, content: [textNode(text)] };
}

export function textToDoc(raw: string, isMarkdown: boolean): string {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const content: Node[] = [];

  let listItems: Node[] = [];
  let listType: "bulletList" | "orderedList" | null = null;

  const flushList = () => {
    if (listType && listItems.length > 0) {
      content.push({ type: listType, content: listItems });
    }
    listItems = [];
    listType = null;
  };

  for (const line of lines) {
    if (isMarkdown) {
      const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
      if (headingMatch) {
        flushList();
        content.push(heading(headingMatch[1].length, headingMatch[2]));
        continue;
      }

      const bulletMatch = line.match(/^\s*[-*]\s+(.*)$/);
      const orderedMatch = line.match(/^\s*\d+\.\s+(.*)$/);

      if (bulletMatch) {
        if (listType !== "bulletList") flushList();
        listType = "bulletList";
        listItems.push({ type: "listItem", content: [paragraph(bulletMatch[1])] });
        continue;
      }
      if (orderedMatch) {
        if (listType !== "orderedList") flushList();
        listType = "orderedList";
        listItems.push({ type: "listItem", content: [paragraph(orderedMatch[1])] });
        continue;
      }
    }

    flushList();
    content.push(paragraph(line));
  }
  flushList();

  const finalContent = content.length > 0 ? content : [{ type: "paragraph" }];

  return JSON.stringify({ type: "doc", content: finalContent });
}
