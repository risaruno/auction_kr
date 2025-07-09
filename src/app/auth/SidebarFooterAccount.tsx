'use client'
import * as React from 'react'
import Stack from '@mui/material/Stack'
import MenuList from '@mui/material/MenuList'
import Button from '@mui/material/Button'
import {
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material'
import Divider from '@mui/material/Divider'
import {
  Account,
  AccountPreview,
  AccountPreviewProps,
} from '@toolpad/core/Account'
import { SidebarFooterProps } from '@toolpad/core/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'

function AccountSidebarPreview(props: AccountPreviewProps & { mini: boolean }) {
  const { handleClick, open, mini } = props
  return (
    <Stack direction='column' p={0} overflow='hidden'>
      <Divider />
      <AccountPreview
        variant={mini ? 'condensed' : 'expanded'}
        slotProps={{ avatarIconButton: { sx: mini ? { border: '0' } : {} } }}
        handleClick={handleClick}
        open={open}
      />
    </Stack>
  )
}

const SidebarFooterAccountPopover = () => {
  const { signOut } = useAuth()
  return (
    <Stack direction='column' sx={{ width: 150, gap: 0 }}>
      <MenuList>
        <Button
          variant='text'
          fullWidth
          startIcon={<SettingsIcon />}
          href='/auth/user/profile'
        >
          비밀번호 변경
        </Button>
      </MenuList>
      <MenuList>
        <Button
          variant='text'
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={signOut}
        >
          로그아웃
        </Button>
      </MenuList>
    </Stack>
  )
}

const createPreviewComponent = (mini: boolean) => {
  function PreviewComponent(props: AccountPreviewProps) {
    return <AccountSidebarPreview {...props} mini={mini} />
  }
  return PreviewComponent
}

const createPopoverComponent = (mini: boolean) => {
  function PopoverComponent() {
    return <SidebarFooterAccountPopover />
  }
  return PopoverComponent
}

export default function SidebarFooterAccount({ mini }: SidebarFooterProps) {
  const PreviewComponent = React.useMemo(
    () => createPreviewComponent(mini),
    [mini]
  )
  const PopoverComponent = React.useMemo(
    () => createPopoverComponent(mini),
    [mini]
  )
  // return (
  //   <>
  //     <Box
  //       sx={{
  //         display: "flex",
  //         alignItems: "center",
  //         justifyContent: "center",
  //         p: 2,
  //         borderTop: "1px solid",
  //         borderColor: "divider",
  //       }}
  //     >
  //       <Avatar
  //         sx={{
  //           width: 46,
  //           height: 46,
  //           bgcolor: "primary.light",
  //           fontSize: "0.8rem",
  //           mr: mini ? 0 : 2,
  //         }}
  //       >
  //         T
  //       </Avatar>
  //       {!mini && (
  //         <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
  //           <Box>
  //             <Typography variant="body2">Test</Typography>
  //             <Typography variant="caption" color="text.secondary">
  //               test@test.com
  //             </Typography>
  //           </Box>
  //           <Box>
  //             <Typography variant="body2">Test</Typography>
  //             <Typography variant="caption" color="text.secondary">
  //               test@test.com
  //             </Typography>
  //           </Box>
  //         </Box>
  //       )}
  //     </Box>
  //   </>
  // );
  return (
    <Account
      slots={{
        preview: PreviewComponent,
        popoverContent: PopoverComponent,
      }}
      slotProps={{
        popover: {
          transformOrigin: { horizontal: 'left', vertical: 'top' },
          anchorOrigin: { horizontal: 'right', vertical: 'bottom' },
          slotProps: {
            paper: {
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: (theme) =>
                  `drop-shadow(0px 2px 8px ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.32)'})`,
                mt: 1,
                '&::before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  bottom: 10,
                  left: 0,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translate(-50%, -50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            },
          },
        },
      }}
    />
  )
}

export function ToolbarAccountOverride() {
  return null
}
