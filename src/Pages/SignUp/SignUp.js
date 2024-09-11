import { Box, Typography } from "@mui/material";
import React, { useState } from "react";
import { SendSignupVerificationOtp, Signup } from "../../apis/Axios";
import MyButton from "../../components/Buttons/MyButton";
import MyTextField from "../../components/TextField/MyTextField";
import MyTextFieldLabel from "../../components/TextField/MyTextFieldLabel";
import ProfileImgUploader from "../../components/Uploader/ProfileImgUploader";
import { routesUrls } from "../../routes/urls";
import {
  fetchMethod,
  GridContainer,
  GridItem,
  pageGridSpacing,
  showObjErrors,
  SnackBarComponent,
  useForm,
  useNavigationWithState,
  useSnackbar,
} from "../../utils/Helper";

export default function SignUp() {
  const initialSubmitDataFields = {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    username: "",
    password: "",
    selectedFile: "",
    loading: false,
  };
  const [submitData, setSubmitData] = useState(initialSubmitDataFields);

  const { setNavigateState } = useNavigationWithState();
  const { snackbar, showSuccessSnackbar, showErrorSnackbar } = useSnackbar();
  const { errors, handleInvalid, handleChange, setErrors } =
    useForm(setSubmitData);

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        submitData.password
      )
    ) {
      setSubmitData((prev) => ({ ...prev, loading: true }));
      const formData = new FormData();
      formData.append("firstName", submitData.firstName);
      formData.append("lastName", submitData.lastName);
      formData.append("email", submitData.email);
      formData.append("profile", "dkafksdfas");
      formData.append("username", submitData.username);
      formData.append("password", submitData.password);
      // sign up
      const { response: signupResponse } = await fetchMethod(() =>
        Signup(formData)
      );
      if (signupResponse.status) {
        // send verification code
        const { response: sendSignupVerificationOtpResponse } =
          await fetchMethod(() =>
            SendSignupVerificationOtp(signupResponse.data?._id)
          );
        if (sendSignupVerificationOtpResponse.status) {
          setNavigateState(routesUrls.VERIFY_OTP, {
            userId: sendSignupVerificationOtpResponse.data?.userId,
            username: submitData.username,
            password: submitData.password,
          });
        } else {
          showErrorSnackbar(signupResponse.message);
        }
      } else {
        const errors = signupResponse.errors;
        showObjErrors(errors, showErrorSnackbar);
      }
      setSubmitData((prev) => ({ ...prev, loading: false }));
    } else {
      setErrors((prev) => [...prev, "password"]);
    }
  };

  return (
    <>
      <Box height={"100%"} mt={pageGridSpacing}>
        <GridContainer
          component={"form"}
          onSubmit={handleSignUp}
          onInvalid={handleInvalid}
        >
          <GridItem md={12}>
            <ProfileImgUploader
              profileImg={submitData.imgUrl}
              updateMode={true}
              file={submitData.selectedFile}
              handleDelete={() => {
                setSubmitData((prev) => ({
                  ...prev,
                  selectedFile: null,
                }));
              }}
              handleChange={(e) => {
                const file = e.target.files[0];
                setSubmitData((prev) => ({
                  ...prev,
                  selectedFile: file,
                }));
              }}
            />
          </GridItem>
          <GridItem>
            <MyTextFieldLabel title={"First Name"} />
            <MyTextField
              value={submitData.firstName}
              onChange={handleChange}
              name={"firstName"}
              errors={errors}
            />
          </GridItem>
          <GridItem>
            <MyTextFieldLabel title={"Last Name"} />
            <MyTextField
              value={submitData.lastName}
              onChange={handleChange}
              name={"lastName"}
              errors={errors}
            />
          </GridItem>
          <GridItem>
            <MyTextFieldLabel title={"Email"} />
            <MyTextField
              type="email"
              value={submitData.email}
              onChange={handleChange}
              name={"email"}
              errors={errors}
              errorMsg={"Invalid Email"}
            />
          </GridItem>
          <GridItem>
            <MyTextFieldLabel title={"Phone"} />
            <MyTextField
              type={"number"}
              value={submitData.phone}
              onChange={handleChange}
              name={"phone"}
              errors={errors}
            />
          </GridItem>
          <GridItem md={12}>
            <Typography variant="h3" color={"primary"}>
              Users Credentials
            </Typography>
          </GridItem>
          <GridItem>
            <MyTextFieldLabel title={"Username"} />
            <MyTextField
              value={submitData.username}
              onChange={handleChange}
              name={"username"}
              errors={errors}
            />
          </GridItem>
          <GridItem>
            <MyTextFieldLabel title={"Password"} />
            <MyTextField
              type="password"
              passwordType={true}
              errorMsg={
                "Password must contain 8 characters and at least one uppercase letter, one lowercase letter, one number, and one special character"
              }
              value={submitData.password}
              onChange={handleChange}
              name={"password"}
              errors={errors}
            />
          </GridItem>
          <GridItem md={12} textAlign={"right"}>
            <MyButton
              title={"Sign Up"}
              type={"submit"}
              loading={submitData.loading}
            />
          </GridItem>
        </GridContainer>
      </Box>
      <SnackBarComponent data={snackbar} />
    </>
  );
}
