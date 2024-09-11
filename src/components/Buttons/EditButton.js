import { Button, CircularProgress } from "@mui/material";
import React from "react";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
export default function EditButton(props) {
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
        <ModeEditIcon sx={{ color: "#fff", fontSize: { xs: 20, md: 25 } }} />
      )}
    </Button>
  );
}
