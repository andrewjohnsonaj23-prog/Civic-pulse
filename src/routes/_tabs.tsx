import { createFileRoute, Outlet } from "@tanstack/react-router";
import { BottomTabs } from "@/components/BottomTabs";
import { TabHelpButton } from "@/components/TabHelpButton";

export const Route = createFileRoute("/_tabs")({
  component: TabsLayout,
});

function TabsLayout() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col">
      <main className="flex-1 pb-24">
        <Outlet />
      </main>
      <TabHelpButton />
      <BottomTabs />
    </div>
  );
}

