"use client";
import { createTheme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'
import { inputsCustomizations } from '@/components/shared-theme/customizations/inputs'
import { dataDisplayCustomizations } from '@/components/shared-theme/customizations/dataDisplay'
import { feedbackCustomizations } from '@/components/shared-theme/customizations/feedback'
import { navigationCustomizations } from '@/components/shared-theme/customizations/navigation'
import { surfacesCustomizations } from '@/components/shared-theme/customizations/surfaces'
import { colorSchemes, typography, shadows, shape } from '@/components/shared-theme/themePrimitives'

const theme = createTheme({
  // The palette object is no longer needed here because
  // `colorSchemes` is handling it.
  cssVariables: {
    colorSchemeSelector: "data-mui-color-scheme",
    cssVarPrefix: "template",
  },
  colorSchemes, // Your new green theme is passed in here
  typography,
  shadows,
  shape,
  components: {
    ...inputsCustomizations,
    ...dataDisplayCustomizations,
    ...feedbackCustomizations,
    ...navigationCustomizations,
    ...surfacesCustomizations,
  },
});

export default theme;
