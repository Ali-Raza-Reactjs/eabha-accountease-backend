import React from "react";
import { Button, CircularProgress } from "@mui/material";
import { primary } from "../../utils/Helper";
export default function MyButton(props) {
  const {
    title,
    type,
    onClick,
    color = "#fff",
    background = primary,
    width,
    loading,
    minWidth,
    height = { xs: 40, md: 51 },
    disabled,
    ...other
  } = props;

  return (
    <Button
      type={type}
      onClick={onClick}
      {...other}
      disabled={loading || disabled}
      sx={{
        width: width,
        minWidth: minWidth,
        height: height,
        padding: other.p || { xs: "15px 25px", md: "19px 50px !important" },
        background: `${
          loading || disabled ? "rgba(0, 0, 0, 0.12)" : background
        } !important`,
        borderRadius: { xs: "5px", md: "10px" },
        color: `${
          loading || disabled ? "rgba(0, 0, 0, 0.26)" : color
        } !important`,
      }}
    >
      {loading ? <CircularProgress size={28} /> : title}
    </Button>
  );
}
