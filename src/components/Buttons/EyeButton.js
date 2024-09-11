import { Button, CircularProgress } from "@mui/material";
import React from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";

export default function EyeButton(props) {
  const { onClick, color = "primary", loading } = props;
  return (
    <Button
      onClick={onClick}
      variant="contained"
      color={color}
      sx={{
        width: { xs: 30, md: 40 },
        minWidth: { xs: 30, md: 40 },
        height: { xs: 30, md: 40 },
        borderRadius: { xs: "5px", md: "10px" },
      }}
    >
      {loading ? (
        <CircularProgress size={28} />
      ) : (
        <VisibilityIcon sx={{ color: "#fff", fontSize: { xs: 20, md: 25 } }} />
      )}
    </Button>
  );
}
