import { Box, Typography } from "@mui/material";
import React from "react";
import { pagePadding, secondary } from "../../utils/Helper";

export default function PageHeader({ title, children }) {
  return (
    <Box
      bgcolor={secondary}
      height={{ xs: 40, md: 60 }}
      px={pagePadding}
      className={"flex_between"}
    >
      <Typography variant="h3" color={"#fff"}>
        {title}
      </Typography>
      <Box>{children}</Box>
    </Box>
  );
}
