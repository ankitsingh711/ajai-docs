import { describe, it, expect } from "vitest";
import { textToDoc } from "../src/lib/textToDoc";

describe("textToDoc", () => {
  it("converts plain text lines into paragraphs (no markdown parsing)", () => {
    const result = JSON.parse(textToDoc("Hello world\nSecond line", false));
    expect(result.type).toBe("doc");
    expect(result.content).toHaveLength(2);
    expect(result.content[0]).toEqual({
      type: "paragraph",
      content: [{ type: "text", text: "Hello world" }],
    });
    // A "# Heading" line should NOT become a heading when isMarkdown=false.
    const literalHash = JSON.parse(textToDoc("# not a heading", false));
    expect(literalHash.content[0].type).toBe("paragraph");
  });

  it("converts markdown headings into heading nodes with correct level", () => {
    const result = JSON.parse(textToDoc("# Title\n## Subtitle\nBody text", true));
    expect(result.content[0]).toMatchObject({ type: "heading", attrs: { level: 1 } });
    expect(result.content[1]).toMatchObject({ type: "heading", attrs: { level: 2 } });
    expect(result.content[2]).toMatchObject({ type: "paragraph" });
  });

  it("groups consecutive markdown bullet lines into a single bulletList", () => {
    const result = JSON.parse(textToDoc("- one\n- two\n- three", true));
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("bulletList");
    expect(result.content[0].content).toHaveLength(3);
  });

  it("groups consecutive markdown numbered lines into a single orderedList", () => {
    const result = JSON.parse(textToDoc("1. first\n2. second", true));
    expect(result.content[0].type).toBe("orderedList");
    expect(result.content[0].content).toHaveLength(2);
  });

  it("falls back to a single empty paragraph for empty input", () => {
    const result = JSON.parse(textToDoc("", false));
    expect(result.content).toEqual([{ type: "paragraph" }]);
  });
});
