"use client";

import { useEditor, EditorContent, type Editor as TiptapEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

export default function Editor({
  content,
  editable,
  onChange,
}: {
  content: unknown;
  editable: boolean;
  onChange: (json: unknown) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    content: content as any,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  // Keep editable state in sync if it changes after mount (not expected in
  // this app, but cheap to guard against).
  useEffect(() => {
    editor?.setEditable(editable);
  }, [editable, editor]);

  if (!editor) return null;

  return (
    <div>
      <Toolbar editor={editor} disabled={!editable} />
      <div className="editor-surface">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function Toolbar({ editor, disabled }: { editor: TiptapEditor; disabled: boolean }) {
  if (disabled) return null;

  const items: { label: string; title: string; isActive: () => boolean; run: () => void }[] = [
    {
      label: "B",
      title: "Bold",
      isActive: () => editor.isActive("bold"),
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "I",
      title: "Italic",
      isActive: () => editor.isActive("italic"),
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: "U",
      title: "Underline",
      isActive: () => editor.isActive("underline"),
      run: () => editor.chain().focus().toggleUnderline().run(),
    },
    {
      label: "H1",
      title: "Heading 1",
      isActive: () => editor.isActive("heading", { level: 1 }),
      run: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      label: "H2",
      title: "Heading 2",
      isActive: () => editor.isActive("heading", { level: 2 }),
      run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "•",
      title: "Bullet list",
      isActive: () => editor.isActive("bulletList"),
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "1.",
      title: "Numbered list",
      isActive: () => editor.isActive("orderedList"),
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
  ];

  return (
    <div className="editor-toolbar">
      {items.map((item) => (
        <button
          key={item.title}
          title={item.title}
          className={item.isActive() ? "is-active" : ""}
          onClick={item.run}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
