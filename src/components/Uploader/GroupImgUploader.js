import { Avatar, Box } from "@mui/material";
import React from "react";
import GroupsIcon from "@mui/icons-material/Groups";
import LocalSeeIcon from "@mui/icons-material/LocalSee";
import CrossIconButton from "../Buttons/CrossIconButton";
export default function GroupImgUploader({ src, handleDelete, onClick }) {
  return (
    <>
      {src ? (
        <Box sx={{ position: "relative", cursor: "pointer" }}>
          <Avatar
            variant="rounded"
            sx={{
              width: 100,
              height: 100,
              border: "1px solid rgba(30, 30, 30, 0.1)",
            }}
            src={src}
          />
          <CrossIconButton
            onClick={handleDelete}
            sx={{ position: "absolute", zIndex: 33, top: 0, right: 0 }}
            color="error"
          />
        </Box>
      ) : (
        <Box sx={{ position: "relative", cursor: "pointer" }} onClick={onClick}>
          <Avatar variant="rounded" sx={{ width: 100, height: 100 }}>
            <GroupsIcon fontSize="large" />
          </Avatar>
          <Box
            position="absolute"
            className={"flex_center"}
            sx={{
              bgcolor: "#f1f1f1",
              borderRadius: "50%",
              width: 30,
              height: 30,
              right: 2,
              bottom: 2,
            }}
          >
            <LocalSeeIcon sx={{ fontSize: { xs: 18, md: 22 } }} />
          </Box>
        </Box>
      )}
    </>
  );
}
