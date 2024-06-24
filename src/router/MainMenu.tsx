import { Box, Button, Typography } from "@mui/material";
import ReleaseNotes from "components/ReleaseNotes";
import { useNavigate } from "react-router";

type Props = {
  title: string;
};

export default function MainMenu({ title }: Props) {
  const navigate = useNavigate();
  return (
    <div className="app">
      <Box
        sx={{
          textAlign: "left",
          float: "left",
          position: "absolute",
          paddingLeft: 6,
          paddingTop: 3,
        }}
      >
        <Typography variant="body2" style={{ cursor: "pointer" }}>
          <Button onClick={() => navigate("/turnir")}>Турнир</Button>
          <Button onClick={() => navigate("/voting")}>Голосование</Button>
          <ReleaseNotes />
        </Typography>
      </Box>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        style={{
          fontWeight: "bold",
          fontSize: "2em",
          margin: 20,
          textAlign: "center",
        }}
      >
        <Box>{title}</Box>
      </Box>
    </div>
  );
}
