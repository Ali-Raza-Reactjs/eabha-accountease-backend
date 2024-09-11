import { Box, ButtonBase, Typography } from "@mui/material";
import { MuiOtpInput } from "mui-one-time-password-input";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ResetPassword, UpdatePassword, sendOTP } from "../../../apis/Axios";
import logo from "../../../assets/logo.png";
import MyButton from "../../../components/Buttons/MyButton";
import ModalComponent from "../../../components/Modals/ModalComponent";
import MyTextField from "../../../components/TextField/MyTextField";
import { routesUrls } from "../../../routes/urls";
import {
  SnackBarComponent,
  fetchMethod,
  primary,
  useForm,
  useSnackbar,
} from "../../../utils/Helper";

export default function ForgetPasswordModal(props) {
  const { open, onClose } = props;
  const navigate = useNavigate();
  const { snackbar, showErrorSnackbar } = useSnackbar();
  const [submitData, setSubmitData] = useState({
    username: null,
    otp: "",
    loading: false,
    otpStep: false,
    updatePasswordStep: false,
    newPassword: "",
    confirmNewPassword: "",
    OTPResponse: {},
    token: "",
    userId: "",
  });
  const [minutes, setMinutes] = useState(1);
  const [seconds, setSeconds] = useState(59);
  const { errors, handleInvalid, handleChange, setErrors } =
    useForm(setSubmitData);

  const handleSendOTP = async () => {
    const { response } = await fetchMethod(
      () => sendOTP(submitData.username),
      setSubmitData
    );
    if (response.status) {
      setSubmitData((prev) => ({
        ...prev,
        otpStep: true,
        OTPResponse: response.data,
        token: response.token,
        userId: response.userId,
      }));
    } else {
      showErrorSnackbar(response.message);
    }
  };
  const handleVerifyOTP = () => {
    if (submitData.OTPResponse?.otp == submitData.otp) {
      setSubmitData((prev) => ({
        ...prev,
        otpStep: false,
        updatePasswordStep: true,
      }));
    } else {
      showErrorSnackbar("Invalid OTP");
    }
  };
  const handleUpdatePassword = async () => {
    if (submitData.newPassword === submitData.confirmNewPassword) {
      const { response } = await fetchMethod(
        () =>
          ResetPassword(
            submitData.userId,
            submitData.newPassword,
            submitData.token
          ),
        setSubmitData
      );
      if (response.status) {
        navigate(routesUrls.LOG_IN, {
          state: {
            open: true,
            msg: response.message + ".Please login again with new password",
            type: "success",
          },
        });
        onClose();
      }
    } else {
      setErrors(["confirmNewPassword"]);
    }
  };
  const resendOTP = async () => {
    await handleSendOTP();
    setMinutes(1);
    setSeconds(59);
    setSubmitData((prev) => ({ ...prev, otp: "" }));
  };

  useEffect(() => {
    // Function to handle the countdown logic
    const interval = setInterval(() => {
      // Decrease seconds if greater than 0
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }

      // When seconds reach 0, decrease minutes if greater than 0
      if (seconds === 0) {
        if (minutes === 0) {
          // Stop the countdown when both minutes and seconds are 0
          clearInterval(interval);
        } else {
          // Reset seconds to 59 and decrease minutes by 1
          setSeconds(59);
          setMinutes(minutes - 1);
        }
      }
    }, 1000); // Run this effect every 1000ms (1 second)

    return () => {
      // Cleanup: stop the interval when the component unmounts
      clearInterval(interval);
    };
  }, [seconds]); // Re-run this effect whenever 'seconds' changes

  console.log(submitData);
  return (
    <>
      <ModalComponent
        open={open}
        onClose={onClose}
        fullScreen={true}
        crossBtn={false}
        hasDialogTitle={false}
      >
        <Box
          px={{ xs: 1, md: 7.5 }}
          my={{ xs: 1, md: 2 }}
          height={"100%"}
          className={"flex_col"}
        >
          <Box
            component={"img"}
            src={logo}
            width={"100%"}
            maxWidth={{ xs: 80, md: 120 }}
          />

          <Box
            className={"flex_center flex_col"}
            sx={{
              gap: { xs: 1, md: 3 },
              width: { xs: "100%", md: "50%" },
              m: "auto",
            }}
            onInvalid={handleInvalid}
            onSubmit={(e) => {
              e.preventDefault();
              submitData.otpStep
                ? handleVerifyOTP()
                : submitData.updatePasswordStep
                ? handleUpdatePassword()
                : handleSendOTP();
            }}
            component={"form"}
          >
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h3" color={primary}>
                {submitData.updatePasswordStep
                  ? "Please Update Your Password"
                  : submitData.otpStep
                  ? "Please enter your OTP"
                  : "Please enter your username"}
              </Typography>
              {submitData.otpStep && (
                <Typography variant="h6" color={primary}>
                  Time Remaining:{" "}
                  <span style={{ fontWeight: 600 }}>
                    {minutes < 10 ? `0${minutes}` : minutes}:
                    {seconds < 10 ? `0${seconds}` : seconds}
                  </span>
                </Typography>
              )}
            </Box>

            <Box
              width={{ xs: "100%", md: submitData.otpStep ? "50%" : "100%" }}
            >
              {submitData.otpStep ? (
                <MuiOtpInput
                  value={submitData.otp}
                  onChange={(value) =>
                    setSubmitData((prev) => ({ ...prev, otp: value }))
                  }
                />
              ) : submitData.updatePasswordStep ? (
                <Box className={"flex_col"} gap={{ xs: 1, md: 3 }}>
                  <MyTextField
                    passwordType={true}
                    placeholder={"New Password"}
                    type={"password"}
                    name={"newPassword"}
                    value={submitData.newPassword}
                    onChange={handleChange}
                    errors={errors}
                  />
                  <MyTextField
                    passwordType={true}
                    placeholder={"Confirm New Password"}
                    type={"password"}
                    name={"confirmNewPassword"}
                    value={submitData.confirmNewPassword}
                    onChange={handleChange}
                    errors={errors}
                    errorMsg={"Password does not match"}
                  />
                </Box>
              ) : (
                <MyTextField
                  placeholder={"username/email"}
                  name={"username"}
                  value={submitData.username}
                  onChange={handleChange}
                  errors={errors}
                />
              )}
              <Box>
                <Box textAlign={"right"}>
                  <Typography
                    component={ButtonBase}
                    variant="h6"
                    color={primary}
                    sx={{
                      my: 0.5,
                      fontWeight: "bold",
                      textDecoration: "underline",
                    }}
                    onClick={submitData.otpStep ? resendOTP : onClose}
                  >
                    {submitData.otpStep ? "Resend OTP?" : "login?"}
                  </Typography>
                </Box>

                <Box className={"flex_center"}>
                  <MyButton
                    loading={submitData.loading}
                    title={
                      submitData.otpStep
                        ? "Verify OTP"
                        : submitData.updatePasswordStep
                        ? "Update Password"
                        : "Send OTP"
                    }
                    width={{ xs: "80%", md: "50%" }}
                    sx={{ alignSelf: "center" }}
                    type={"submit"}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </ModalComponent>
      <SnackBarComponent data={snackbar} />
    </>
  );
}
