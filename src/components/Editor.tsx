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

  const marks: { title: string; icon: JSX.Element; isActive: () => boolean; run: () => void }[] = [
    {
      title: "Bold",
      icon: <BoldIcon />,
      isActive: () => editor.isActive("bold"),
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      title: "Italic",
      icon: <ItalicIcon />,
      isActive: () => editor.isActive("italic"),
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      title: "Underline",
      icon: <UnderlineIcon />,
      isActive: () => editor.isActive("underline"),
      run: () => editor.chain().focus().toggleUnderline().run(),
    },
  ];

  const blocks: { title: string; icon: JSX.Element; isActive: () => boolean; run: () => void }[] = [
    {
      title: "Heading 1",
      icon: <HeadingIcon level={1} />,
      isActive: () => editor.isActive("heading", { level: 1 }),
      run: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      title: "Heading 2",
      icon: <HeadingIcon level={2} />,
      isActive: () => editor.isActive("heading", { level: 2 }),
      run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
  ];

  const lists: { title: string; icon: JSX.Element; isActive: () => boolean; run: () => void }[] = [
    {
      title: "Bullet list",
      icon: <BulletListIcon />,
      isActive: () => editor.isActive("bulletList"),
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      title: "Numbered list",
      icon: <OrderedListIcon />,
      isActive: () => editor.isActive("orderedList"),
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
  ];

  return (
    <div className="editor-toolbar">
      {marks.map((item) => (
        <ToolbarButton key={item.title} {...item} />
      ))}
      <span className="divider" />
      {blocks.map((item) => (
        <ToolbarButton key={item.title} {...item} />
      ))}
      <span className="divider" />
      {lists.map((item) => (
        <ToolbarButton key={item.title} {...item} />
      ))}
    </div>
  );
}

function ToolbarButton({
  title,
  icon,
  isActive,
  run,
}: {
  title: string;
  icon: JSX.Element;
  isActive: () => boolean;
  run: () => void;
}) {
  return (
    <button title={title} className={isActive() ? "is-active" : ""} onClick={run} type="button">
      {icon}
    </button>
  );
}

function BoldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z" strokeLinejoin="round" />
    </svg>
  );
}

function ItalicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M10 4h8M6 20h8M14 4l-4 16" strokeLinecap="round" />
    </svg>
  );
}

function UnderlineIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M6 4v7a6 6 0 0 0 12 0V4M4 20h16" strokeLinecap="round" />
    </svg>
  );
}

function HeadingIcon({ level }: { level: 1 | 2 }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M4 5v14M12 5v14M4 12h8" strokeLinecap="round" />
      {level === 1 ? (
        <path d="M20 19v-8l-2 1.5" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M16.5 12a2.5 2.5 0 1 1 4 2L16 19h5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

function BulletListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <circle cx="4.5" cy="6" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="18" r="1.3" fill="currentColor" stroke="none" />
      <path d="M9 6h11M9 12h11M9 18h11" strokeLinecap="round" />
    </svg>
  );
}

function OrderedListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 6h11M9 12h11M9 18h11" strokeLinecap="round" />
      <text x="1.5" y="8.5" fontSize="7" fill="currentColor" stroke="none">1</text>
      <text x="1.5" y="14.5" fontSize="7" fill="currentColor" stroke="none">2</text>
      <text x="1.5" y="20.5" fontSize="7" fill="currentColor" stroke="none">3</text>
    </svg>
  );
}
