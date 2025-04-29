import * as React from 'react';
import { Typography } from '@mui/material';

export default function SitemarkIcon() {
  return (
    <Typography
      variant="h5"
      component="a"
      href="/"
      sx={(theme) => ({
        display: "flex",
        alignItems: "center",
        fontWeight: 700,
        textDecoration: "none",
        color: 'primary.main',
        margin: "0 8px",
        ...theme.applyStyles('dark', {
          color: 'primary.light',
        }),
      })}
    >
      Certo
    </Typography>
  );
}
