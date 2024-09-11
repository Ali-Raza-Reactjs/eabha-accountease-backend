import React from "react";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { Box, CircularProgress, IconButton, TextField } from "@mui/material";
import { secondary } from "../../utils/Helper";

export default function MySearchField(props) {
  const {
    inputRef,
    handleSearch = () => {},
    placeholder,
    type = "text",
    loading,
  } = props;
  return (
    <Box
      type={type}
      component={TextField}
      inputRef={inputRef}
      placeholder={placeholder}
      width="100%"
      sx={{
        "&input": {
          borderRadius: "10px",
        },
        "& .MuiInputBase-root": {
          borderRadius: "10px",
          paddingRight: 1,
          background: "rgba(30, 30, 30, 0.02)",
        },
      }}
      InputProps={{
        endAdornment: loading ? (
          <CircularProgress size={30} />
        ) : (
          <IconButton
            sx={{
              backgroundColor: secondary,
              ":hover": {
                backgroundColor: secondary,
              },
            }}
            onClick={(e) => {
              e.preventDefault();
              handleSearch();
            }}
          >
            <SearchOutlinedIcon sx={{ color: "#fff" }} />
          </IconButton>
        ),
      }}
      onKeyDown={(e) => {
        const searchValue = e.target.value;
        inputRef.current.value = searchValue;
        if (e.key === "Enter") {
          e.preventDefault();
          handleSearch();
        }
      }}
    />
  );
}
