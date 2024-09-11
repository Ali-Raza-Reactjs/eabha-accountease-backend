import LocalSeeIcon from "@mui/icons-material/LocalSee";
import { Avatar, Box, ButtonBase } from "@mui/material";
import React, { useRef } from "react";
import CrossIconButton from "../Buttons/CrossIconButton";

export default function ProfileImgUploader(props) {
  const { handleChange, handleDelete, file, profileImg, updateMode } = props;
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  return (
    <>
      {!updateMode ? (
        <Avatar
          src={profileImg || ""}
          alt=""
          sx={{
            width: { xs: 100, md: 140 },
            height: { xs: 100, md: 140 },
          }}
        />
      ) : file ? (
        <Box position={"relative"}>
          <CrossIconButton
            onClick={handleDelete}
            sx={{ position: "absolute", zIndex: 33 }}
            color="error"
          />
          <Avatar
            src={file ? URL.createObjectURL(file) : profileImg || ""}
            alt=""
            sx={{
              width: { xs: 100, md: 140 },
              height: { xs: 100, md: 140 },
              border: "1px solid rgba(30, 30, 30, 0.1)",
            }}
          />
        </Box>
      ) : (
        <Box
          position="relative"
          component={ButtonBase}
          disableRipple
          onClick={handleClick}
        >
          <Box position="relative">
            <Avatar
              src={file ? URL.createObjectURL(file) : profileImg || ""}
              alt=""
              sx={{
                width: { xs: 100, md: 140 },
                height: { xs: 100, md: 140 },
              }}
            />
            <Box
              position="absolute"
              bgcolor="#f1f1f1"
              p={{ xs: 0.5, md: 1 }}
              borderRadius="50%"
              right={10}
              bottom={-2}
              display={file ? "none" : "flex"}
              sx={{ cursor: "pointer" }}
            >
              <LocalSeeIcon sx={{ fontSize: { xs: 18, md: 22 } }} />
            </Box>
          </Box>
          <input
            ref={fileInputRef}
            hidden
            type="file"
            onChange={handleChange}
            accept="image/*"
          />
        </Box>
      )}
    </>
  );
}
