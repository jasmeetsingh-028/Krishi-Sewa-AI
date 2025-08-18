// components/custom-sidebar.tsx
"use client";
import {
  Bot,
  Mic,
  Phone,
  PhoneCall,
  Edit,
  Search,
  Settings,
  User,
  Menu,
  ChevronUp,
  LayoutDashboard
} from "lucide-react";
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "./ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

// Main navigation items (ChatGPT style)
const mainNavigationItems = [
  {
    title: "New chat",
    url: "/new-chat",
    icon: Edit,
    shortcut: "⌘⇧O",
  },
  {
    title: "Search chats",
    url: "/search",
    icon: Search,
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
];

// AI Options
const aiOptions = [
  {
    title: "Conversational AI",
    url: "/conversational-ai",
    icon: Bot,
  },
  {
    title: "Voice AI",
    url: "/voice-ai",
    icon: Mic,
  },
];

const telephonyItems = [
  {
    title: "Phone Numbers",
    url: "/phone",
    icon: Phone,
  },
  // {
  //   title: "Outbound",
  //   url: "/outbound",
  //   icon: PhoneCall,
  // },
];

const CustomSidebar = () => {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="bg-gray-900">
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-white hover:bg-gray-800">
              <Link href="/">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">KrishiSewa AI</span>
                  </div>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="text-white">
        {/* Main Navigation - ChatGPT Style */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavigationItems.map((item) => {
                const isSelected = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`
                        h-11 rounded-xl transition-all duration-200
                        ${
                          isSelected
                            ? "bg-gray-800 text-white"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                        }
                      `}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.shortcut && (
                          <span className="ml-auto text-xs text-gray-500">
                            {item.shortcut}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* AI Options */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wide text-gray-400">
            AI Options
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {aiOptions.map((item) => {
                const isSelected = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`
                        h-11 rounded-xl transition-all duration-200
                        ${
                          isSelected
                            ? "bg-gray-800 text-white border border-gray-600"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                        }
                      `}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {isSelected && (
                          <div className="ml-auto">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Telephony
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {telephonyItems.map((item) => {
                const isSelected = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`
                        h-10 transition-all duration-200
                        ${
                          isSelected
                            ? "bg-gray-800 text-white"
                            : "text-gray-300 hover:text-white hover:bg-gray-800"
                        }
                      `}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Profile Footer */}
      <SidebarFooter>
        <SidebarMenu className="px-0">
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full h-12 text-white hover:bg-gray-800 transition-colors">
                  <div className="flex mr-2 items-center gap-2 w-full">
                    {/* User Avatar */}
                    <div className="w-8 h-8 bg-gray-700 rounded-full mr-3 flex items-center justify-center shrink-0">
                      <span className="text-sm font-medium text-white">A</span>
                    </div>
                    {/* User Info */}
                    <div className="flex-1 text-left group-data-[collapsible=icon]:hidden">
                      <div className="text-sm font-medium text-white">
                        Abhishek
                      </div>
                    </div>
                    {/* Chevron */}
                    <ChevronUp className="w-4 h-4 text-gray-400 group-data-[collapsible=icon]:hidden" />
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                side="top"
                className="w-48 mb-2 bg-gray-800 border-gray-700 text-white rounded-lg shadow-lg"
              >
                <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 text-white cursor-pointer">
                  <User className="w-4 h-4 mr-3" />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 text-white cursor-pointer">
                  <Menu className="w-4 h-4 mr-3" />
                  Menu
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 text-white cursor-pointer">
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default CustomSidebar;
