import { Box, ButtonBase, Typography } from "@mui/material";
import { MuiOtpInput } from "mui-one-time-password-input";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SendSignupVerificationOtp, VerifySignupOtp } from "../../apis/Axios";
import MyButton from "../../components/Buttons/MyButton";
import {
  fetchMethod,
  SnackBarComponent,
  useGetWindowHeight,
  useSnackbar,
} from "../../utils/Helper";
import { handleLogin } from "../LogIn/Login";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const { height } = useGetWindowHeight();
  const { state: navigationStateData } = useLocation();
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
  const [minutes, setMinutes] = useState(9);
  const [seconds, setSeconds] = useState(59);

  const handleResendOTP = async () => {
    await fetchMethod(() =>
      SendSignupVerificationOtp(navigationStateData.userId)
    );
    setMinutes(9);
    setSeconds(59);
    setSubmitData((prev) => ({ ...prev, otp: "" }));
  };

  const handleVerifyOTP = async () => {
    if (submitData.otp.length === 4) {
      const { response: verifySignupOtpResponse } = await fetchMethod(() =>
        VerifySignupOtp(navigationStateData?.userId, submitData.otp)
      );

      if (verifySignupOtpResponse.status) {
        handleLogin(
          navigationStateData?.username,
          navigationStateData?.password,
          navigate,
          showErrorSnackbar,
          setSubmitData
        );
      } else {
        showErrorSnackbar(verifySignupOtpResponse.msg);
      }
    } else {
      showErrorSnackbar("Invalid Otp");
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }
      if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(interval);
        } else {
          setSeconds(59);
          setMinutes(minutes - 1);
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [seconds]);
  return (
    <>
      <Box sx={{ height: height - 104 }}>
        <Box
          px={{ xs: 1, md: 7.5 }}
          my={{ xs: 1, md: 2 }}
          height={"100%"}
          className={"flex_col"}
        >
          <Box
            className={"flex_center flex_col"}
            sx={{
              gap: { xs: 1, md: 3 },
              width: { xs: "100%", md: "50%" },
              m: "auto",
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h3" color={"primary"}>
                Please enter your OTP
              </Typography>

              <Typography variant="h6" color={"primary"}>
                Time Remaining:{" "}
                <span style={{ fontWeight: 600 }}>
                  {minutes < 10 ? `0${minutes}` : minutes}:
                  {seconds < 10 ? `0${seconds}` : seconds}
                </span>
              </Typography>
            </Box>

            <Box width={"50%"}>
              <MuiOtpInput
                value={submitData.otp}
                onChange={(value) =>
                  setSubmitData((prev) => ({ ...prev, otp: value }))
                }
              />

              <Box>
                <Box textAlign={"right"}>
                  <Typography
                    component={ButtonBase}
                    variant="h6"
                    color={"primary"}
                    sx={{
                      my: 0.5,
                      fontWeight: "bold",
                      textDecoration: "underline",
                    }}
                    onClick={handleResendOTP}
                  >
                    {"Resend OTP?"}
                  </Typography>
                </Box>

                <Box className={"flex_center"}>
                  <MyButton
                    loading={submitData.loading}
                    title={"Verify OTP"}
                    width={"100%"}
                    sx={{ alignSelf: "center" }}
                    onClick={handleVerifyOTP}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      <SnackBarComponent data={snackbar} />
    </>
  );
}
