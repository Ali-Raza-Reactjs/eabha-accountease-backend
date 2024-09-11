import { Box, Chip, FormControl, FormHelperText, Select } from "@mui/material";
import React from "react";

export default function MySelect(props) {
  const {
    value,
    onChange,
    required = true,
    disabled,
    name,
    errors = [],
    children,
    ...others
  } = props;
  const hasError = !disabled && required && errors.includes(name);
  return (
    <>
      <FormControl
        sx={{
          width: "100%",
        }}
        error={hasError}
      >
        <Select
          value={value}
          onChange={onChange}
          required={required}
          name={name}
          error={hasError}
          sx={{
            background: "rgba(30, 30, 30, 0.02)",
            borderRadius: { xs: "5px", md: "10px" },
            minHeight: { xs: 40, md: 56 },
            display: "flex",
            flexWrap: "wrap",
          }}
          {...others}
        >
          {children}
        </Select>
        {hasError && (
          <FormHelperText sx={{ color: "#d32f2f" }}>
            Field Required
          </FormHelperText>
        )}
      </FormControl>
    </>
  );
}
