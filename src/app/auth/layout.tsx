"use client";
import * as React from "react";
import { NextAppProvider } from "@toolpad/core/nextjs";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import {
  Dashboard as DashboardIcon,
  AssignmentInd as ExpertIcon,
  Person as PersonIcon,
  Gavel as GavelIcon,
  History as HistoryIcon,
  AccountCircle as AccountCircleIcon,
  SupervisorAccount as SupervisorAccountIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Quiz as QuizIcon,
} from "@mui/icons-material";
import type { Navigation } from "@toolpad/core/AppProvider";
import theme from "@/theme";

import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { DashboardLayout, ThemeSwitcher } from "@toolpad/core/DashboardLayout";
import Copyright from "@/components/dashboard/Copyright";
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
  isUser,
} from "@/utils/auth/roles-client";
import { ArrowBack, Home, Redo, Undo } from "@mui/icons-material";

function CustomActions() {
  return (
    <Stack direction="row" alignItems="center">
      <ThemeSwitcher />
      <ToolbarAccountOverride />
    </Stack>
  );
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
    {
      kind: "divider",
    },
  ];

  // Admin/Management navigation
  if (isAdmin(userRole)) {
    // Super admin only features
    if (isSuperAdmin(userRole)) {
      baseNavigation.push(
        {
          kind: "header",
          title: "콘텐츠 관리",
        },
        {
          segment: "auth/manage",
          title: "대시보드",
          icon: <DashboardIcon />,
        },
        {
          segment: "auth/manage/bids",
          title: "입찰 신청 관리",
          icon: <GavelIcon />,
        },
        {
          segment: "auth/manage/experts",
          title: "전문가 관리",
          icon: <ExpertIcon />,
        },
        {
          segment: "auth/manage/faqs",
          title: "자주하는 질문 관리",
          icon: <QuizIcon />,
        },
        {
          kind: "divider",
        },
        {
          kind: "header",
          title: "고객 지원",
        },
        {
          segment: "auth/manage/inquiries",
          title: "문의 관리",
          icon: <QuestionAnswerIcon />,
        },
        {
          kind: "divider",
        },
        {
          kind: "header",
          title: "관리자 메뉴",
        },
        {
          segment: "auth/manage/users",
          title: "사용자 관리",
          icon: <PersonIcon />,
        },
        {
          segment: "auth/manage/managers",
          title: "관리자 관리",
          icon: <SupervisorAccountIcon />,
        },
        {
          kind: "divider",
        }
      );
    }

    // Content management (for super admin and content managers)
    if (canManageContent(userRole)) {
      baseNavigation.push(
        {
          kind: "header",
          title: "콘텐츠 관리",
        },
        {
          segment: "auth/manage/dashboard",
          title: "대시보드",
          icon: <DashboardIcon />,
        },
        {
          segment: "auth/manage/experts",
          title: "전문가 관리",
          icon: <ExpertIcon />,
        },
        {
          segment: "auth/manage/faqs",
          title: "자주하는 질문 관리",
          icon: <QuizIcon />,
        },
        {
          kind: "divider",
        },
        {
          kind: "header",
          title: "고객 지원",
        },
        {
          segment: "auth/manage/inquiries",
          title: "문의 관리",
          icon: <QuestionAnswerIcon />,
        },
        {
          kind: "divider",
        }
      );
    }

    // Content management (for super admin and content managers)
    if (canHandleSupport(userRole)) {
      baseNavigation.push(
        {
          kind: "header",
          title: "고객 지원",
        },
        {
          segment: "auth/manage/inquiries",
          title: "문의 관리",
          icon: <QuestionAnswerIcon />,
        },
        {
          kind: "divider",
        }
      );
    }
  }

  if (isUser(userRole)) {
    baseNavigation.push(
      {
        kind: "header",
        title: "마이페이지",
      },
      {
        segment: "auth/user/history",
        title: "서비스 내역",
        icon: <HistoryIcon />,
      },
      {
        segment: "auth/user/info",
        title: "입찰 정보",
        icon: <AccountCircleIcon />,
      },
      {
        kind: "divider",
      }
    );
  }

  return baseNavigation;
}

export default function Layout(props: { children: React.ReactNode }) {
  const { user, session, signOut, loading, isInitialized } = useAuth();
  const navigation = useNavigation();

  // Redirect to sign-in if not authenticated and not loading
  // React.useEffect(() => {
  //   if (isInitialized && !loading && !session && !user) {
  //     window.location.href = "/sign/in";
  //   }
  // }, [isInitialized, loading, session, user]);

  const authentication = React.useMemo(() => {
    return {
      signIn: async () => {
        // Redirect to sign-in page since we can't handle sign-in directly in the layout
        window.location.href = "/sign/in";
      },
      signOut: async () => {
        await signOut();
      },
    };
  }, [signOut]);

  // Create session object that Toolpad expects
  const toolpadSession = React.useMemo(() => {
    if (!session || !user) return null;

    return {
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        image: session.user.user_metadata?.avatar_url || null,
      },
    };
  }, [session, user]);

  return (
    <NextAppProvider
      theme={theme}
      navigation={navigation}
      authentication={authentication}
      session={toolpadSession}
    >
      {loading ? (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          height="100vh"
          gap={2}
        >
          <CircularProgress size={40} />
          <Typography variant="body1" color="text.secondary">
            인증 정보를 확인하는 중...
          </Typography>
        </Box>
      ) : (
        <DashboardLayout
          branding={{
            logo: <Sitemark />,
            title: "",
            homeUrl: "/auth",
          }}
          slots={{
            toolbarActions: CustomActions,
            sidebarFooter: SidebarFooterAccount,
          }}
        >
          {props.children}
          <Copyright sx={{ my: 4 }} />
        </DashboardLayout>
      )}
    </NextAppProvider>
  );
}
