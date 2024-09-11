import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import React from "react";
import CrossIconButton from "../Buttons/CrossIconButton";
import MyButton from "../Buttons/MyButton";
import { DialogContentComp, DialogContentTextComp } from "../../utils/Helper";
import ModalComponent from "./ModalComponent";
export default function DeleteModal(props) {
  const {
    open,
    onClose,
    handleDelete,
    deleteName,
    loading,
    deleteDetails = false,
  } = props;
  return (
    <ModalComponent
      open={open}
      onClose={onClose}
      maxWidth="md"
      title={"Confirmation Modal"}
    >
      <DialogContentComp>
        <DialogContentTextComp>
          <Typography variant="h4" fontWeight={400}>
            Are you sure you want to delete{" "}
            {deleteDetails || <b>{deleteName}</b>}?
          </Typography>
          <Typography variant="h3" mt={1}>
            {loading && <b className="red">Deleting {deleteName}...</b>}
          </Typography>
        </DialogContentTextComp>
      </DialogContentComp>
      <DialogActions>
        <MyButton onClick={onClose} title={"No"} width={200} />
        <MyButton
          onClick={handleDelete}
          title={"Yes"}
          width={200}
          color={"#fff"}
          background={"#d32f2f"}
        />
      </DialogActions>
    </ModalComponent>
  );
}
