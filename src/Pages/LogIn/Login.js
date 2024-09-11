import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  ButtonBase,
  IconButton,
  InputAdornment,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Login } from "../../apis/Axios";
import loginLog from "../../assets/eabha-accountease.png";
import logo from "../../assets/logo.png";
import MyButton from "../../components/Buttons/MyButton";
import MyTextField from "../../components/TextField/MyTextField";
import { setThisKeyCookie } from "../../utils/Cookies";
import {
  Enums,
  NavigateSnackbar,
  SnackBarComponent,
  encryptData,
  fetchMethod,
  primary,
  useSnackbar,
} from "../../utils/Helper";
import ForgetPasswordModal from "./Modals/ForgetPassword";
import { routesUrls } from "../../routes/urls";

export const handleLogin = async (
  username,
  password,
  navigate,
  showErrorSnackbar,
  setLoadingMethod
) => {
  const { response } = await fetchMethod(
    () => Login(username, password),
    setLoadingMethod
  );
  if (response.status) {
    const data = response.data;
    setThisKeyCookie(Enums.cookiesKeys.JWT_TOKEN, data.accessToken);
    setThisKeyCookie(Enums.cookiesKeys.EXPIRY_DATE_TIME, data.expiryDateTime);
    setThisKeyCookie(
      Enums.cookiesKeys.MEMBER_NAME,
      `${data?.user?.firstName} ${data?.user?.lastName}`
    );
    setThisKeyCookie(Enums.cookiesKeys.PROFILE_PHOTO, data?.user?.profile);
    navigate("/");
  } else {
    showErrorSnackbar(response.msg);
  }
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { snackbar, showErrorSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = useState(false);
  const [submitData, setSubmitData] = useState({
    username: null,
    password: null,
    loading: false,
  });
  const [forgetPassword, setForgetPassword] = useState({
    open: false,
  });
  const [errors, setError] = useState([]);

  const handleChangeSubmitFields = (e) => {
    handleFilterError(e);
    setSubmitData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  // handleInvalid;
  const handleInvalid = (e) => {
    setError([...errors, e.target.name]);
  };

  // handleFilterError
  const handleFilterError = (e) => {
    const name = e.target.name;
    let new_errors = errors.filter((er) => er !== name);
    setError(new_errors);
  };
  // handleShowPassword
  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <Box className={"flex_between"} height={"100vh"}>
        <Box
          flexBasis={"50%"}
          display={{ xs: "none", md: "block" }}
          sx={{ bgcolor: primary, height: "100%" }}
          className={"flex_center"}
        >
          <Box
            maxWidth={500}
            component={"img"}
            src={loginLog}
            width={"100%"}
            height={"auto"}
          />
        </Box>
        <Box
          flexBasis={{ xs: "100%", md: "50%" }}
          className={"flex_center"}
          flexDirection={"column"}
          gap={{ xs: 1, md: 3 }}
          px={{ xs: 1, md: 8 }}
          height={"100%"}
          component={"form"}
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin(
              submitData.username,
              submitData.password,
              navigate,
              showErrorSnackbar,
              setSubmitData
            );
          }}
          onInvalid={handleInvalid}
        >
          <Box
            component={"img"}
            src={logo}
            width={"100%"}
            maxWidth={{ xs: 200, md: 300 }}
            mb={4}
          />
          <Typography variant="h3" color={primary}>
            Welcome back! Please enter your sign in details.
          </Typography>
          <MyTextField
            placeholder={"username"}
            name={"username"}
            value={submitData.username}
            onChange={handleChangeSubmitFields}
            errors={errors}
          />
          <Box
            sx={{
              width: "100%",
            }}
          >
            <MyTextField
              placeholder={"password"}
              type={showPassword ? "text" : "password"}
              name={"password"}
              value={submitData.password}
              onChange={handleChangeSubmitFields}
              errors={errors}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleShowPassword}
                      onMouseDown={(event) => {
                        event.preventDefault();
                      }}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Box textAlign={"right"}>
              <Typography
                component={ButtonBase}
                variant="h6"
                color={primary}
                sx={{ my: 0.5, fontWeight: 600, textDecoration: "underline" }}
                onClick={() =>
                  setForgetPassword((prev) => ({ ...prev, open: true }))
                }
              >
                Forget password?
              </Typography>
            </Box>
            <Box className={"flex_center"}>
              <MyButton
                loading={submitData.loading}
                title={"Log In"}
                width={{ xs: "80%", md: "50%" }}
                sx={{ alignSelf: "center" }}
                type={"submit"}
              />
            </Box>
          </Box>
          <Box>
            <Typography
              variant="h6"
              color={primary}
              onClick={() =>
                setForgetPassword((prev) => ({ ...prev, open: true }))
              }
            >
              Don't have an account?{" "}
              <Box
                component={ButtonBase}
                sx={{ fontWeight: 600, textDecoration: "underline" }}
                onClick={() => navigate(routesUrls.SIGN_UP)}
              >
                Sign Up
              </Box>
            </Typography>
          </Box>
        </Box>
      </Box>
      <SnackBarComponent data={snackbar} />
      <NavigateSnackbar />
      {forgetPassword.open && (
        <ForgetPasswordModal
          open={forgetPassword.open}
          onClose={() =>
            setForgetPassword((prev) => ({ ...prev, open: false }))
          }
        />
      )}
    </>
  );
}
