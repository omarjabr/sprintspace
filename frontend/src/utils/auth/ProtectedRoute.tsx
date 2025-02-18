import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { UserContext } from "./UserProvider";

import { AppSidebar } from "@/components/app-sidebar";
import { FullPageLoader } from "@/components/layout/full-page-loader";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export const ProtectedRoute = () => {
  const { currentUser, isLoading } = useContext(UserContext);

  if (isLoading) {
    return <FullPageLoader />;
  } else if (!currentUser || currentUser === "Guest") {
    return <Navigate to="/login" />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className=" w-full flex h-11 shrink-0 bg-sidebar border-b items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>
        <div className=" h-full">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
