import { Box } from "@mui/material";
import logo from "../../assets/logo.png";
import React from "react";

export default function UnAuthNavbar({ children }) {
  return (
    <Box
      px={{ xs: 1, md: 7.5 }}
      my={{ xs: 1, md: 2 }}
      height={"100%"}
      className={"flex_col"}
    >
      <Box
        component={"img"}
        src={logo}
        width={"100%"}
        maxWidth={{ xs: 80, md: 120 }}
      />
      <Box>{children}</Box>
    </Box>
  );
}
