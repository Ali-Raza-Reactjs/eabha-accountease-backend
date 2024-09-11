import { Button, CircularProgress } from "@mui/material";
import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
export default function DeleteButton(props) {
  const { onClick, loading } = props;
  return (
    <Button
      onClick={onClick}
      variant="contained"
      color={"error"}
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
        <DeleteIcon sx={{ color: "#fff", fontSize: { xs: 20, md: 25 } }} />
      )}
    </Button>
  );
}
