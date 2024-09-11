import React from "react";
import { Button, Typography } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { secondary } from "../../utils/Helper";

export default function FileUploader({ onChange }) {
  return (
    <>
      <Button
        component="label"
        variant="contained"
        color="secondary"
        sx={{
          "&.MuiButtonBase-root": {
            height: { xs: 40, md: 51 },
            borderRadius: { xs: "5px", md: "10px" },
          },
        }}
        fullWidth
        startIcon={
          <UploadFileIcon
            sx={{
              color: "#fff",
            }}
          />
        }
      >
        <Typography variant="h6" color={"#fff"}>
          Upload File
        </Typography>

        <input hidden type="file" onChange={onChange} accept="image/*" />
      </Button>
    </>
  );
}
