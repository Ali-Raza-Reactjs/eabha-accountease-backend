import { Box, Dialog, DialogTitle, Typography } from "@mui/material";
import React from "react";
import CrossIconButton from "../Buttons/CrossIconButton";

export default function ModalComponent(props) {
  const {
    open,
    onClose,
    title,
    titleBtn,
    maxWidth = "xl",
    fullScreen = false,
    children,
    crossBtn = true,
    hasDialogTitle = true,
  } = props;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth={true}
      fullScreen={fullScreen}
      maxWidth={maxWidth}
      PaperProps={{
        sx: {
          m: fullScreen ? 0 : { xs: 1, md: 4 },
          width: "100% !important",
        },
      }}
      sx={{
        "& form": {
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {hasDialogTitle && (
        <DialogTitle
          className="flex_between"
          sx={{
            p: { xs: 0.75, md: "16px 24px" },
          }}
        >
          <Typography variant="h2" fontWeight={600}>
            {title}
          </Typography>
          <Box>
            {titleBtn}
            {crossBtn && <CrossIconButton onClick={onClose} />}
          </Box>
        </DialogTitle>
      )}
      {children}
    </Dialog>
  );
}
