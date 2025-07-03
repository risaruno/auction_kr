import * as React from 'react'
import { Typography } from '@mui/material'
import Link from 'next/link';

export default function SitemarkIcon() {
  return (
    <>
      <Link
        href='/'
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <Typography
          variant='h5'
          sx={(theme) => ({
            display: 'flex',
            alignItems: 'center',
            fontWeight: 700,
            textDecoration: 'none',
            color: 'primary.main',
            margin: '0 8px',
            ...theme.applyStyles('dark', {
              color: 'primary.light',
            }),
          })}
        >
          Certo
        </Typography>
      </Link>
    </>
  )
}
