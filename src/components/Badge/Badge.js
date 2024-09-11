import { Box, Typography } from "@mui/material";
import React from "react";

export default function Badge(props) {
  const { title, color = "yellow" } = props;
  return (
    <Box
      sx={{
        borderRadius: "15px",
        width: "fit-content",
        background:
          color === "green"
            ? "rgba(0, 201, 56, 0.1);"
            : color === "yellow"
            ? "rgba(255, 153, 0, 0.1);"
            : color === "red"
            ? "rgba(249, 65, 65, 0.1)"
            : color === "purple"
            ? "rgba(0, 0, 255, 0.1)"
            : "",
        p: "4px 10px",
        textAlign: "center",
      }}
    >
      <Typography
        variant="body1"
        color={
          color === "green"
            ? "#00C938"
            : color === "yellow"
            ? "#FF9900"
            : color === "red"
            ? "#F94141"
            : color === "purple"
            ? "#0000FF"
            : ""
        }
      >
        {title}
      </Typography>
    </Box>
  );
}
