import React from "react";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
export default function CrossIconButton({
  onClick,
  color = "primary",
  ...others
}) {
  return (
    <IconButton onClick={onClick} {...others}>
      <CloseIcon color={color} fontSize="small" />
    </IconButton>
  );
}
