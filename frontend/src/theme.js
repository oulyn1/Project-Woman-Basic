import { createTheme } from '@mui/material/styles'

const FOCUS_COLOR = '#C0C0C0'

// Create a theme instance.
const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-mui-color-scheme'
  },
  admin: {
    focusColor: FOCUS_COLOR
  },
  colorSchemes: {
  }
})

export default theme