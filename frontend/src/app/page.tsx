// app/page.tsx
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/actions/auth.action";
import CustomSidebar from "@/components/custom-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import Navbar from "@/components/Navbar";
import { cookies } from "next/headers";
import Landing from "@/components/Landing";

export default async function Home() {
  // const isUserAuthenticated = await isAuthenticated();
  // if (!isUserAuthenticated) {
  //   redirect("/sign-in");
  // }

  // Fix: Await cookies()
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="flex h-screen w-full">
        <CustomSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <div className="flex-1 overflow-hidden">
            <Landing />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
