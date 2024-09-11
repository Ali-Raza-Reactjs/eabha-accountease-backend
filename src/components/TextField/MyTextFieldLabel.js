import { InputLabel } from "@mui/material";
import React from "react";
import { secondary } from "../../utils/Helper";

export default function MyTextFieldLabel(props) {
  const { title, required = true, color = secondary, sx } = props;
  return (
    <InputLabel
      required={required}
      sx={{
        fontSize: { xs: 12, md: 14 },
        fontWeight: "600 !important",
        lineHeight: "28px !important",
        color: `${color} !important`,
        "& .MuiFormLabel-asterisk": {
          color: "red !important",
        },
        ...sx,
      }}
    >
      {title}
    </InputLabel>
  );
}
