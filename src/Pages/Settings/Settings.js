import { Box, Dialog, DialogActions, DialogContent } from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UpdatePassword } from "../../apis/Axios";
import MyButton from "../../components/Buttons/MyButton";
import PageHeader from "../../components/PageHeader/PageHeader";
import MyTextField from "../../components/TextField/MyTextField";
import MyTextFieldLabel from "../../components/TextField/MyTextFieldLabel";
import { routesUrls } from "../../routes/urls";
import { getThisKeyCookie, removeThisKeyCookie } from "../../utils/Cookies";
import {
  Enums,
  GridContainer,
  GridItem,
  LoadingTextField,
  SnackBarComponent,
  SwitchComponent,
  fetchMethod,
  pageGridSpacing,
  pagePadding,
  useForm,
  useSnackbar,
} from "../../utils/Helper";

export default function Settings() {
  const navigate = useNavigate();
  const initialSubmitDataFields = {
    open: false,
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    loading: false,
  };
  const [submitData, setSubmitData] = useState(initialSubmitDataFields);
  const { snackbar, showErrorSnackbar, showSuccessSnackbar } = useSnackbar();
  const { errors, handleInvalid, handleChange, setErrors } =
    useForm(setSubmitData);
  const handleUpdatePasswordClose = () => {
    setSubmitData(initialSubmitDataFields);
    setErrors([]);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    const cookie_userId = getThisKeyCookie(Enums.cookiesKeys.USER_ID);

    if (submitData.newPassword === submitData.confirmNewPassword) {
      const { response } = await fetchMethod(
        () =>
          UpdatePassword(
            cookie_userId,
            submitData.oldPassword,
            submitData.newPassword
          ),
        setSubmitData
      );
      if (response.status) {
        removeThisKeyCookie(Enums.cookiesKeys.JWT_TOKEN);
        navigate(routesUrls.LOG_IN, {
          state: {
            open: true,
            msg: response.message + ".Please login again with new password",
            type: "success",
          },
        });
      }
    } else {
      setErrors(["confirmNewPassword"]);
    }
  };

  return (
    <>
      <PageHeader title={"Settings"}>
        <SwitchComponent
          checked={submitData.open}
          onChange={(e) => {
            setSubmitData((prev) => ({
              ...prev,
              open: e.target.checked,
            }));
          }}
        />
      </PageHeader>
      <Box height={"100%"} px={pagePadding} mt={pageGridSpacing}>
        <GridContainer>
          <GridItem>
            <MyTextFieldLabel title={"Username/Email"} required={false} />
            {false ? (
              <LoadingTextField />
            ) : (
              <MyTextField
                disabled
                value={getThisKeyCookie(Enums.cookiesKeys.MEMBER_EMAIL)}
              />
            )}
          </GridItem>
          <GridItem>
            <MyTextFieldLabel title={"Password"} required={false} />
            <MyTextField disabled value={"●●●●●●●●●"} />
          </GridItem>
        </GridContainer>
      </Box>
      {/* update modal */}
      <Dialog
        fullWidth
        maxWidth={"sm"}
        open={submitData.open}
        onClose={handleUpdatePasswordClose}
      >
        <form onSubmit={handleUpdatePassword} onInvalid={handleInvalid}>
          <DialogContent>
            <GridItem xs={12}>
              <MyTextFieldLabel title={"Current Password"} />
              <MyTextField
                type={"password"}
                passwordType={true}
                value={submitData.oldPassword}
                name={"oldPassword"}
                onChange={handleChange}
                errors={errors}
              />
            </GridItem>
            <GridItem xs={12}>
              <MyTextFieldLabel title={"New Password"} />
              <MyTextField
                type={"password"}
                passwordType={true}
                value={submitData.newPassword}
                name={"newPassword"}
                onChange={handleChange}
                errors={errors}
              />
            </GridItem>
            <GridItem xs={12}>
              <MyTextFieldLabel title={"Confirm New Password"} />
              <MyTextField
                type={"password"}
                passwordType={true}
                value={submitData.confirmNewPassword}
                name={"confirmNewPassword"}
                onChange={handleChange}
                errors={errors}
                errorMsg={"Password does not match"}
              />
            </GridItem>
          </DialogContent>
          <DialogActions>
            <MyButton
              title={"Update"}
              type={"submit"}
              loading={submitData.loading}
            />
          </DialogActions>
        </form>
      </Dialog>
      <SnackBarComponent data={snackbar} />
    </>
  );
}
