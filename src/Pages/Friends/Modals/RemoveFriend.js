import { DialogActions, Typography } from "@mui/material";
import React, { useState } from "react";
import { DeleteFriend } from "../../../apis/Axios";
import ModalComponent from "../../../components/Modals/ModalComponent";
import { routesUrls } from "../../../routes/urls";
import {
  fetchMethod,
  Member,
  useNavigateSnackbar,
} from "../../../utils/Helper";
import {
  DialogContentComp,
  DialogContentTextComp,
} from "../../../utils/Helper";
import MyButton from "../../../components/Buttons/MyButton";

export default function RemoveFriendModal(props) {
  const { open, onClose, data, handleGetFriends } = props;
  const [loading, setLoading] = useState(false);
  const { setSuccessNavigationSnackbar } = useNavigateSnackbar();
  const handleRemove = async () => {
    const { response } = await fetchMethod(
      () => DeleteFriend(data?._id),
      setLoading,
      false
    );
    if (response.status) {
      setSuccessNavigationSnackbar(routesUrls.FRIENDS, response.msg);
      handleGetFriends();
      onClose();
    }
  };
  return (
    <ModalComponent
      open={open}
      onClose={onClose}
      maxWidth={"xs"}
      title={"Confirmation Modal"}
    >
      <DialogContentComp>
        <DialogContentTextComp>
          <Member
            src={data?.profile}
            name={`${data?.firstName} ${data?.lastName}`}
            email={data?.email}
          />
        </DialogContentTextComp>
      </DialogContentComp>
      <DialogActions>
        <MyButton onClick={onClose} title={"Close"} />
        <MyButton
          loading={loading}
          onClick={handleRemove}
          title={"Remove"}
          color={"#fff"}
          background={"#d32f2f"}
        />
      </DialogActions>
    </ModalComponent>
  );
}
