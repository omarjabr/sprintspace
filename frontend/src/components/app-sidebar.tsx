import { Layout } from "lucide-react";
import * as React from "react";

import { CompanySwitcher } from "@/components/company-switcher";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { UserContext } from "@/utils/auth/UserProvider";
import { useFrappeGetDoc, useFrappeGetDocList } from "frappe-react-sdk";
import { NavProjects } from "./nav-projects";

const data = {
  navMain: [
    {
      title: "Boards",
      url: "/",
      icon: Layout,
      isActive: true,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { currentUser, logout } = React.useContext(UserContext);

  // Get user details
  const { data: user } = useFrappeGetDoc<{
    full_name: string;
    email: string;
    user_image: string;
  }>("User", currentUser);

  // Get companies
  const { data: companies } = useFrappeGetDocList<{
    name: string;
  }>("Company");

  // Get projects
  const { data: projects } = useFrappeGetDocList<{
    name: string;
    project_name: string;
  }>("Project", {
    fields: ["name", "project_name"],
    filters: [
      ["_assign", "like", `%"${currentUser}"%`],
      ["status", "=", "Open"],
    ],
    orderBy: {
      field: "creation",
      order: "desc",
    },
  });

  if (!user || !companies) {
    return null;
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <CompanySwitcher companies={companies} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={projects || []} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} logout={logout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
