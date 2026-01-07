import Navbar from "@/app/components/Navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="app-shell">
        <div className="container">{children}</div>
      </main>
    </>
  );
}
