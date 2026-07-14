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
        // Keyed on the signed-in user so switching users (via UserSwitcher +
        // router.refresh()) remounts this component instead of reusing the
        // old instance. Without this, useState(initialOwned) below would
        // keep the previous user's document list, since React only reads a
        // useState initializer on mount, not on every prop update.
        key={user.id}
        currentUser={{ id: user.id, name: user.name, email: user.email }}
        initialOwned={JSON.parse(JSON.stringify(owned))}
        initialShared={JSON.parse(JSON.stringify(shared))}
      />
    </main>
  );
}
