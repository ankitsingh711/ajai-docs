import { getCurrentUser } from "@/lib/currentUser";
import { getDashboardData } from "@/lib/documents";
import Dashboard from "@/components/Dashboard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <main className="container">
        <div className="error-banner">
          No users found. Run <code>npm run seed</code> to create the mocked accounts, then reload.
        </div>
      </main>
    );
  }

  const { owned, shared } = await getDashboardData(user.id);

  return (
    <main className="container">
      <Dashboard
        currentUser={{ id: user.id, name: user.name, email: user.email }}
        initialOwned={JSON.parse(JSON.stringify(owned))}
        initialShared={JSON.parse(JSON.stringify(shared))}
      />
    </main>
  );
}
