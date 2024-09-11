import { Box, ButtonBase } from "@mui/material";
import React from "react";

export default function ButtonBaseComp({ onClick, children }) {
  return (
    <Box
      onClick={onClick}
      component={ButtonBase}
      sx={{ fontWeight: 600, textDecoration: "underline" }}
    >
      {children}
    </Box>
  );
}
