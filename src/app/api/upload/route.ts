import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/currentUser";
import { textToDoc } from "@/lib/textToDoc";

const MAX_FILE_BYTES = 1_000_000; // 1MB — generous for text/markdown, keeps abuse in check
const ALLOWED_EXTENSIONS = [".txt", ".md"];

// POST /api/upload — multipart/form-data with a single "file" field.
// Supported types are intentionally limited to .txt and .md (stated in the
// UI and README): a well-scoped import beats a half-working .docx parser.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No current user" }, { status: 500 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const name = file.name || "upload.txt";
  const ext = name.slice(name.lastIndexOf(".")).toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return NextResponse.json(
      { error: `Unsupported file type "${ext}". Only .txt and .md are supported.` },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "File is too large (1MB limit)" }, { status: 413 });
  }

  const raw = await file.text();
  const content = textToDoc(raw, ext === ".md");
  const title = name.replace(/\.(txt|md)$/i, "") || "Imported document";

  const document = await prisma.document.create({
    data: { title, ownerId: user.id, content },
  });

  return NextResponse.json({ document }, { status: 201 });
}
