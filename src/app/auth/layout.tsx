"use client";
import * as React from "react";
import { NextAppProvider } from "@toolpad/core/nextjs";
import PersonIcon from "@mui/icons-material/Person";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import GavelIcon from "@mui/icons-material/Gavel";
import ExpertIcon from "@mui/icons-material/Psychology";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import HistoryIcon from "@mui/icons-material/History";
import InfoIcon from "@mui/icons-material/Info";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import type { Navigation } from "@toolpad/core/AppProvider";
import theme from "@/theme";
import Stack from "@mui/material/Stack";
import { DashboardLayout, ThemeSwitcher } from "@toolpad/core/DashboardLayout";
import Copyright from "../components/Copyright";
import Sitemark from "@/components/marketing-page/components/SitemarkIcon";
import SidebarFooterAccount, {
  ToolbarAccountOverride,
} from "./SidebarFooterAccount";
import { useAuth } from "@/contexts/AuthContext";
import {
  isAdmin,
  isSuperAdmin,
  canManageContent,
  canHandleSupport,
} from "@/utils/auth/roles-client";
import { ArrowBack, Home, Redo, Undo } from "@mui/icons-material";

function CustomActions() {
  return <Stack direction="row" alignItems="center"></Stack>;
}

function useNavigation(): Navigation {
  const { user } = useAuth();
  const userRole = user?.admin_role;

  // Base navigation for all authenticated users
  const baseNavigation: Navigation = [
    {
      segment: "/",
      title: "홈으로",
      icon: <ArrowBack />,
    },
  ];

  // Admin/Management navigation
  if (isAdmin(userRole)) {
    // Super admin only features
    if (isSuperAdmin(userRole)) {
      baseNavigation.push(
        {
          kind: "header",
          title: "Admin Management",
        },
        {
          segment: "manage/dashboard",
          title: "Admin Dashboard",
          icon: <DashboardIcon />,
        },
        {
          segment: "manage/bids",
          title: "Bid Management",
          icon: <GavelIcon />,
        },
        {
          segment: "manage/users",
          title: "User Management",
          icon: <PersonIcon />,
        },
        {
          segment: "manage/managers",
          title: "Manager Management",
          icon: <SupervisorAccountIcon />,
        }
      );
    }

    // Content management (for super admin and content managers)
    if (canManageContent(userRole)) {
      baseNavigation.push(
        {
          kind: "header",
          title: "Content Management",
        },
        {
          segment: "manage/experts",
          title: "Expert Management",
          icon: <ExpertIcon />,
        },
        {
          segment: "manage/faqs",
          title: "FAQ Management",
          icon: <QuestionAnswerIcon />,
        }
      );
    }

    // Content management (for super admin and content managers)
    if (canHandleSupport(userRole)) {
      baseNavigation.push(
        {
          kind: "header",
          title: "Customer Support",
        },
        {
          segment: "manage/inquiries",
          title: "FAQ Management",
          icon: <QuestionAnswerIcon />,
        }
      );
    }
  } else {
    baseNavigation.push(
      {
        kind: "header",
        title: "My Page",
      },
      {
        segment: "auth/user/profile",
        title: "Profile",
        icon: <AccountCircleIcon />,
      },
      {
        segment: "auth/user/info",
        title: "My Information",
        icon: <InfoIcon />,
      },
      {
        segment: "auth/user/history",
        title: "Service History",
        icon: <HistoryIcon />,
      }
    );
  }

  return baseNavigation;
}

export default function Layout(props: { children: React.ReactNode }) {
  const navigation = useNavigation();

  return (
    <NextAppProvider theme={theme} navigation={navigation}>
      <DashboardLayout
        branding={{
          logo: <Sitemark />,
          title: "Dashboard",
          homeUrl: "/",
        }}
        slots={{
          toolbarActions: CustomActions,
          sidebarFooter: SidebarFooterAccount,
        }}
      >
        {props.children}
        <Copyright sx={{ my: 4 }} />
      </DashboardLayout>
    </NextAppProvider>
  );
}
