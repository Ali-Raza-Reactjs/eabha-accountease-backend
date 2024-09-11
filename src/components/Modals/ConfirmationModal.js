import React from "react";
import ModalComponent from "./ModalComponent";
import {
  DialogContentComp,
  DialogContentTextComp,
  secondary,
} from "../../utils/Helper";
import MyButton from "../Buttons/MyButton";
import { DialogActions, Typography } from "@mui/material";

export default function ConfirmationModal(props) {
  const { open, onClose, title, loading, onConfirm } = props;

  return (
    <ModalComponent
      title={"Confirmation Modal"}
      open={open}
      onClose={onClose}
      maxWidth={"md"}
    >
      <DialogContentComp>
        <DialogContentTextComp>
          <Typography variant="h4" fontWeight={400}>
            Are you sure you want to {title}?
          </Typography>
        </DialogContentTextComp>
      </DialogContentComp>
      <DialogActions>
        <MyButton
          onClick={onClose}
          title={"No"}
          width={200}
          background={secondary}
        />
        <MyButton
          onClick={onConfirm}
          title={"Yes"}
          width={200}
          loading={loading}
        />
      </DialogActions>
    </ModalComponent>
  );
}
