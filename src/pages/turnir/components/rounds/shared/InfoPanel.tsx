import { Paper, useTheme } from '@mui/material'

type Props = {
  children: React.ReactNode
}

export default function InfoPanel(props: Props) {
  const theme = useTheme()
  return (
    <Paper
      elevation={12}
      sx={{
        color: theme.palette.text.secondary,
        paddingTop: 0.5,
        paddingBottom: 0.5,
        paddingLeft: 2,
        paddingRight: 2,
        margin: 1,
        width: 'max-content',
        border: 1,
        borderColor: theme.palette.info.main,
      }}
    >
      {props.children}
    </Paper>
  )
}
