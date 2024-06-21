import { LinearProgress, linearProgressClasses } from "@mui/material";
import { styled } from "@mui/material/styles";

export const BorderLinearProgress = styled(LinearProgress)(({ theme, sx }) => {
  let activeColor = theme.palette.mode === "light" ? "#1a90ff" : "#308fe8";
  if (sx && "backgroundColor" in sx) {
    activeColor = sx.backgroundColor as string;
  }

  return {
    height: 10,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor:
        theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
    },
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 5,
      backgroundColor: activeColor,
    },
  };
});
