// Seeds three mock users so sharing behavior can be demonstrated without a
// real auth system. Safe to re-run (upserts by email).
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const USERS = [
  { name: "Alice Chen", email: "alice@ajaia.test" },
  { name: "Bob Okafor", email: "bob@ajaia.test" },
  { name: "Carol Nguyen", email: "carol@ajaia.test" },
];

async function main() {
  const users = [];
  for (const u of USERS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
    users.push(user);
  }

  const existing = await prisma.document.count();
  if (existing === 0) {
    const [alice, bob] = users;
    const welcome = await prisma.document.create({
      data: {
        title: "Welcome to Ajaia Docs",
        ownerId: alice.id,
        content: JSON.stringify({
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 1 },
              content: [{ type: "text", text: "Welcome to Ajaia Docs" }],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "This document is owned by Alice and shared with Bob. Switch users with the picker in the top right to see the shared view.",
                },
              ],
            },
            {
              type: "bulletList",
              content: [
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "Try bold, italic, and underline" }],
                    },
                  ],
                },
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "Upload a .txt or .md file from the dashboard" }],
                    },
                  ],
                },
              ],
            },
          ],
        }),
      },
    });
    await prisma.share.create({
      data: { documentId: welcome.id, userId: bob.id },
    });
    console.log("Seeded demo document and share.");
  }

  console.log(
    "Seeded users:",
    users.map((u) => u.email).join(", ")
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
