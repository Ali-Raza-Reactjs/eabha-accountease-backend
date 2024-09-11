import {
  DialogActions,
  DialogContent,
  DialogContentText,
  Typography,
} from "@mui/material";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import LoadingBar from "react-top-loading-bar";
import ExpensesPage from "../Pages/Expenses";
import Navbar, { handleLogout } from "../Pages/Navbar/Navbar.js";
import UnAuthNavbar from "../Pages/Navbar/UnAuthNavbar.js";
import VerifyOTP from "../Pages/OTP/OTP.js";
import SettingsPage from "../Pages/Settings/Settings.js";
import SignUpPage from "../Pages/SignUp/SignUp.js";
import { Axios } from "../apis/Axios.js";
import MyButton from "../components/Buttons/MyButton.js";
import ModalComponent from "../components/Modals/ModalComponent.js";
import { getThisKeyCookie } from "../utils/Cookies.js";
import {
  Enums,
  currentDateTime,
  dateTimeFormat,
  primary,
} from "../utils/Helper.js";
import { routesUrls } from "./urls.js";

const ScrollToTop = React.lazy(() =>
  import("../components/ScrollToTop/ScrollToTop.js")
);
const DashboadPage = React.lazy(() => import("../Pages/Dashboad/Dashboard.js"));
const LogInPage = React.lazy(() => import("../Pages/LogIn/Login.js"));
const ProfilePage = React.lazy(() => import("../Pages/Profile/Profile.js"));
const FriendsPage = React.lazy(() => import("../Pages/Friends/Friends.js"));
const ExpensesByGroupIdPage = React.lazy(() =>
  import("../Pages/Expenses/ExpensesByGroupId.js")
);

export default function AppRoutes() {
  const [logout, setLogout] = useState({
    open: false,
  });
  const location = useLocation();
  const navigate = useNavigate();
  const ref = useRef();

  useEffect(() => {
    const requestInterceptor = Axios.interceptors.request.use((config) => {
      ref.current?.continuousStart();
      return config;
    });

    const responseInterceptor = Axios.interceptors.response.use(
      (response) => {
        ref.current?.complete();
        return response;
      },
      (error) => {
        ref.current?.complete();
        return Promise.reject(error);
      }
    );
    return () => {
      Axios.interceptors.request.eject(requestInterceptor);
      Axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // useEffect(() => {
  //   if (isAuthenticated()) {
  //     if (location.pathname === routesUrls.LOG_IN) {
  //       navigate("/");
  //     }
  //   } else {
  //     if (location.pathname === routesUrls.SIGN_UP) {
  //       navigate(routesUrls.SIGN_UP);
  //     } else {
  //       navigate(routesUrls.LOG_IN);
  //     }
  //   }
  // }, [location.pathname]);

  useEffect(() => {
    const expiryDateTime = getThisKeyCookie(Enums.cookiesKeys.EXPIRY_DATE_TIME);
    if (
      location.pathname !== routesUrls.LOG_IN &&
      location.pathname !== routesUrls.SIGN_UP &&
      location.pathname !== routesUrls.VERIFY_OTP
    ) {
      const expiryTime = moment(dateTimeFormat(expiryDateTime)).diff(
        moment(currentDateTime())
      );
      const timer = setTimeout(
        () => {
          setLogout((prev) => ({ ...prev, open: true }));
        },
        expiryDateTime ? expiryTime : 0
      );
      return () => clearTimeout(timer);
    }
  }, [location]);
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* <Route path="*" /> */}
        <Route
          exact
          path="/"
          element={
            <Navbar>
              <DashboadPage />
            </Navbar>
          }
        />
        <Route exact path={routesUrls.LOG_IN} element={<LogInPage />} />
        <Route
          exact
          path={routesUrls.PROFILE}
          element={
            <Navbar>
              <ProfilePage />
            </Navbar>
          }
        />
        <Route
          exact
          path={routesUrls.SETTINGS}
          element={
            <Navbar>
              <SettingsPage />
            </Navbar>
          }
        />
        <Route
          exact
          path={routesUrls.EXPENSES}
          element={
            <Navbar>
              <ExpensesPage />
            </Navbar>
          }
        />
        <Route
          exact
          path={routesUrls.EXPENSES_BY_GROUPID}
          element={
            <Navbar>
              <ExpensesByGroupIdPage />
            </Navbar>
          }
        />
        <Route
          exact
          path={routesUrls.FRIENDS}
          element={
            <Navbar>
              <FriendsPage />
            </Navbar>
          }
        />

        <Route
          exact
          path={routesUrls.SIGN_UP}
          element={
            <UnAuthNavbar>
              <SignUpPage />
            </UnAuthNavbar>
          }
        />
        <Route
          exact
          path={routesUrls.VERIFY_OTP}
          element={
            <UnAuthNavbar>
              <VerifyOTP />
            </UnAuthNavbar>
          }
        />
      </Routes>

      {/* navbar loading */}
      <LoadingBar ref={ref} color={primary} height={4} shadow={false} />

      {/* session expired modal */}
      <ModalComponent
        title={"Your session has expired"}
        open={logout.open}
        onClose={() => {}}
        maxWidth={"sm"}
        crossBtn={false}
      >
        <DialogContent sx={{ p: { xs: 1.25, md: "20px 24px" } }}>
          <DialogContentText>
            <Typography variant="h4" fontWeight={400}>
              Please login again to continue
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MyButton
            title={"Login"}
            background={primary}
            onClick={() => {
              setLogout((prev) => ({ ...prev, open: false }));
              handleLogout(navigate);
            }}
          />
        </DialogActions>
      </ModalComponent>
    </>
  );
}
