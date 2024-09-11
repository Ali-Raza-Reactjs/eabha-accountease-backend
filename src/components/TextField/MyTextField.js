import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import React from "react";
import { useShowPassword } from "../../utils/Helper";

export default function MyTextField(props) {
  const {
    name,
    value,
    onChange,
    errorMsg = "Field Required",
    type = "text",
    required = true,
    errors = [],
    children,
    disabled = false,
    passwordType,
    variant = "outlined",
    inputRef,
    ...others
  } = props;
  const { showPassword, handleShowPassword } = useShowPassword();
  return (
    <TextField
      inputRef={inputRef}
      name={name}
      type={passwordType ? (showPassword ? "text" : "password") : type}
      required={required}
      disabled={disabled}
      error={!disabled && required && errors.indexOf(name) > -1}
      helperText={
        !disabled && required && errors.indexOf(name) > -1 && errorMsg
      }
      size="small"
      fullWidth
      variant={variant}
      value={value}
      onChange={onChange}
      InputProps={{
        endAdornment: type === "password" && (
          <InputAdornment position="end">
            <IconButton
              tabIndex={-1}
              onClick={handleShowPassword}
              onMouseDown={(event) => {
                event.preventDefault();
              }}
            >
              {showPassword ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      {...others}
      sx={{
        "& .MuiInputBase-root": {
          height: { xs: variant === "standard" ? 38 : 40, md: 56 },
          background: "rgba(30, 30, 30, 0.02)",
          borderRadius: { xs: "5px", md: "10px" },
        },
      }}
    >
      {children}
    </TextField>
  );
}
