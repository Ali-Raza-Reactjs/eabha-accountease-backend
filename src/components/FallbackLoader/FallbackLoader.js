import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import React from "react";
import { Circles } from "react-loader-spinner";
import { primary } from "../../utils/Helper";

export default function FallbackLoader() {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("md"));
  return (
    <Box height={"100vh"} width={"100%"} className="flex_center" elevation={0}>
      <Circles
        type="Circles"
        width={matches ? 100 : 168}
        height={matches ? 100 : 168}
        color={primary}
      />
    </Box>
  );
}
