import { Box, DialogActions } from "@mui/material";
import React, { useMemo, useRef, useState } from "react";
import { AddFriends, GetMemberUsingEmail } from "../../../apis/Axios";
import MyButton from "../../../components/Buttons/MyButton";
import ModalComponent from "../../../components/Modals/ModalComponent";
import MySearchField from "../../../components/TextField/MySearchField";
import MyTextFieldLabel from "../../../components/TextField/MyTextFieldLabel";
import { routesUrls } from "../../../routes/urls";
import {
  CheckboxComponent,
  DialogContentComp,
  fetchMethod,
  GridContainer,
  GridItem,
  Member,
  SnackBarComponent,
  useNavigateSnackbar,
  useSnackbar,
} from "../../../utils/Helper";

export default function AddFriendModal(props) {
  const { open, onClose, handleGetFriends } = props;
  const searchField = useRef(null);
  const { snackbar, showSuccessSnackbar, showErrorSnackbar } = useSnackbar();
  const { setSuccessNavigationSnackbar } = useNavigateSnackbar();
  const [friends, setFriends] = useState({
    loading: false,
    data: [],
  });
  const [submitData, setSubmitData] = useState({
    loading: false,
    selectedFriends: {},
  });

  const checkedFriendlist = useMemo(() => {
    const checkedFriends = Object.entries(submitData.selectedFriends).reduce(
      (acc, [id, value]) => {
        if (value) {
          acc.push(id);
        }
        return acc;
      },
      []
    );
    return checkedFriends;
  }, [submitData.selectedFriends]);

  const handleSearch = async () => {
    const email = searchField.current.value;
    if (email) {
      const { response } = await fetchMethod(
        () => GetMemberUsingEmail(email),
        setFriends
      );
      if (response.status) {
        const checkIsFriendExist = friends.data.some(
          (dt) => dt._id === response.data?._id
        );
        if (checkIsFriendExist) {
          showErrorSnackbar("Friend already exists");
          return;
        }
        showSuccessSnackbar(response.msg);
        setFriends((prev) => ({
          ...prev,
          data: [...prev.data, response.data],
        }));
      } else {
        showErrorSnackbar(response.msg);
      }
    } else {
      showErrorSnackbar("Invalid email");
    }
  };

  const handleAddFriends = async () => {
    const { response } = await fetchMethod(
      () => AddFriends(String(checkedFriendlist)),
      setSubmitData
    );
    if (response.status) {
      setSuccessNavigationSnackbar(routesUrls.FRIENDS, response.msg);
      handleGetFriends();
      onClose();
    } else {
      showErrorSnackbar(response.msg);
    }
  };

  return (
    <>
      <ModalComponent
        title={"Add Friend"}
        open={open}
        onClose={onClose}
        maxWidth={"sm"}
      >
        <DialogContentComp>
          <GridContainer spacing={2}>
            <GridItem md={12}>
              <MyTextFieldLabel title={"Email"} />
              <MySearchField
                inputRef={searchField}
                placeholder={"Enter friend's email address"}
                type={"email"}
                handleSearch={handleSearch}
                loading={friends.loading}
              />
            </GridItem>
            {friends.data.length > 0 && (
              <GridItem md={12}>
                <Box
                  sx={{
                    bgcolor: "rgba(30, 30, 30, 0.02)",
                    borderRadius: "10px",
                    border: "1px solid rgb(193 193 193)",
                    p: { xs: 1, md: 2 },
                  }}
                >
                  <GridContainer>
                    {friends.data.map((dt) => (
                      <GridItem md={12} key={dt._id}>
                        <Box className={"flex_between"}>
                          <Member
                            name={`${dt.firstName} ${dt.lastName}`}
                            src={dt.profile}
                            email={dt.email}
                          />
                          <CheckboxComponent
                            value={submitData.selectedFriends[dt._id]}
                            onChange={(e) => {
                              setSubmitData((prev) => ({
                                ...prev,
                                selectedFriends: {
                                  ...prev.selectedFriends,
                                  [dt._id]: e.target.checked,
                                },
                              }));
                            }}
                          />
                        </Box>
                      </GridItem>
                    ))}
                  </GridContainer>
                </Box>
              </GridItem>
            )}
          </GridContainer>
        </DialogContentComp>
        <DialogActions>
          <MyButton
            loading={submitData.loading}
            disabled={!checkedFriendlist.length > 0}
            title={"Add"}
            onClick={handleAddFriends}
          />
        </DialogActions>
      </ModalComponent>
      <SnackBarComponent data={snackbar} />
    </>
  );
}
