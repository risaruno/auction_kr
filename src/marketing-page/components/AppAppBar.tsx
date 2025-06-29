import * as React from "react";
import { useState } from "react";
import { styled, alpha } from "@mui/material/styles";
import type {} from "@mui/material/themeCssVarsAugmentation";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Drawer from "@mui/material/Drawer";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CircularProgress from "@mui/material/CircularProgress";
import ColorModeIconDropdown from "../../shared-theme/ColorModeIconDropdown";
import Sitemark from "./SitemarkIcon";
import { Typography } from "@mui/material";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import DebugAuth from "../../components/DebugAuth";

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexShrink: 0,
  borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
  backdropFilter: "blur(24px)",
  border: "1px solid",
  borderColor: (theme.vars || theme).palette.divider,
  backgroundColor: theme.vars
    ? `rgba(${theme.vars.palette.background.defaultChannel} / 0.4)`
    : alpha(theme.palette.background.default, 0.4),
  boxShadow: (theme.vars || theme).shadows[1],
  padding: "8px 12px",
}));

export default function AppAppBar() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(
    null
  );

  const handleLogout = async () => {
    try {
      await signOut();
      setUserMenuAnchor(null);
    } catch (error) {
      console.error("Logout error:", error);
      setUserMenuAnchor(null);
    }
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  return (
    <AppBar
      position="fixed"
      enableColorOnDark
      sx={{
        boxShadow: 0,
        bgcolor: "transparent",
        backgroundImage: "none",
        mt: "calc(var(--template-frame-height, 0px) + 28px)",
      }}
    >
      <Container maxWidth="lg">
        <StyledToolbar variant="dense" disableGutters>
          <Box
            sx={{ flexGrow: 1, display: "flex", alignItems: "center", px: 0 }}
          >
            <Sitemark />
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                marginLeft: { md: 2 },
              }}
            >
              <Button href="/info" variant="text" color="info" size="small">
                이용 안내
              </Button>
              <Button href="/experts" variant="text" color="info" size="small">
                전문가 서비스
              </Button>
              {/* <Button href="/area" variant="text" color="info" size="small">
                서비스 지역
              </Button> */}
              <Button href="/faq" variant="text" color="info" size="small">
                자주하는 질문
              </Button>
              <Button
                href="/contact"
                variant="text"
                color="info"
                size="small"
                sx={{ minWidth: 0 }}
              >
                1:1 문의
              </Button>
            </Box>
          </Box>

          <DebugAuth />
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 1,
              alignItems: "center",
            }}
          >
            {/* Conditional Rendering based on auth state */}
            {loading ? (
              // If loading, show circular progress or spinner
              <CircularProgress size={24} color="primary" />
            ) : user ? (
              // If the user is logged in:
              <>
                <Button
                  onClick={handleUserMenuOpen}
                  color="primary"
                  variant="text"
                  size="small"
                  startIcon={<AccountCircleIcon />}
                >
                  마이페이지
                </Button>
                <Menu
                  anchorEl={userMenuAnchor}
                  open={Boolean(userMenuAnchor)}
                  onClose={handleUserMenuClose}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                >
                  <MenuItem
                    onClick={() => {
                      router.push("/auth/user/history");
                      handleUserMenuClose();
                    }}
                  >
                    입찰 내역
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      router.push("/auth/user/profile");
                      handleUserMenuClose();
                    }}
                  >
                    프로필 관리
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>로그아웃</MenuItem>
                </Menu>
                <Button
                  href="/apply-bid"
                  color="primary"
                  variant="contained"
                  size="small"
                >
                  대리입찰 신청
                </Button>
              </>
            ) : (
              // If the user is logged out:
              <>
                <Button
                  href="/sign/in"
                  color="primary"
                  variant="text"
                  size="small"
                >
                  로그인/회원가입
                </Button>
                <Button
                  href="/apply-bid"
                  color="primary"
                  variant="contained"
                  size="small"
                >
                  대리입찰 신청
                </Button>
              </>
            )}
            {/* <ColorModeIconDropdown /> */}
          </Box>
          <Box sx={{ display: { xs: "flex", md: "none" }, gap: 1 }}>
            {/* <ColorModeIconDropdown size="medium" /> */}
            <IconButton aria-label="Menu button" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="top"
              open={open}
              onClose={toggleDrawer(false)}
              PaperProps={{
                sx: {
                  top: "var(--template-frame-height, 0px)",
                },
              }}
            >
              <Box sx={{ p: 2, backgroundColor: "background.default" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <IconButton onClick={toggleDrawer(false)}>
                    <CloseRoundedIcon />
                  </IconButton>
                </Box>
                <MenuItem component="a" href="/info">
                  이용 안내
                </MenuItem>
                <MenuItem component="a" href="/experts">
                  전문가 서비스
                </MenuItem>
                <MenuItem component="a" href="/area">
                  서비스 지역
                </MenuItem>
                <MenuItem component="a" href="/faq">
                  자주하는 질문
                </MenuItem>
                <MenuItem component="a" href="/contact">
                  1:1 문의
                </MenuItem>
                <Divider sx={{ my: 3 }} />

                {/* Mobile menu authentication section */}
                {user ? (
                  // If the user is logged in:
                  <Box>
                    <MenuItem
                      onClick={() => {
                        router.push("/auth/user/history");
                        setOpen(false);
                      }}
                    >
                      입찰 내역
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        router.push("/auth/user/profile");
                        setOpen(false);
                      }}
                    >
                      프로필 관리
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>로그아웃</MenuItem>
                    <MenuItem>
                      <Button
                        color="primary"
                        variant="contained"
                        fullWidth
                        href="/apply-bid"
                      >
                        대리입찰 신청
                      </Button>
                    </MenuItem>
                  </Box>
                ) : (
                  // If the user is logged out:
                  <Box>
                    <MenuItem>
                      <Button
                        color="primary"
                        variant="text"
                        fullWidth
                        href="/sign/in"
                      >
                        로그인/회원가입
                      </Button>
                    </MenuItem>
                    <MenuItem>
                      <Button
                        color="primary"
                        variant="contained"
                        fullWidth
                        href="/apply-bid"
                      >
                        대리입찰 신청
                      </Button>
                    </MenuItem>
                  </Box>
                )}
              </Box>
            </Drawer>
          </Box>
        </StyledToolbar>
      </Container>
    </AppBar>
  );
}
