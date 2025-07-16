// This file is intentionally a passthrough layout.
// It satisfies Next.js's requirement for a layout file in this directory,
// while allowing the child layouts ([scorekeeperId]/layout.tsx and create-match/layout.tsx)
// to handle their own specific UI and logic, preventing duplicate headers.

export default function ScorekeeperDashboardParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
