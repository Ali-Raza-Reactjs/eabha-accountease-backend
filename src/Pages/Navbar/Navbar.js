import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import PaymentIcon from "@mui/icons-material/Payment";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import {
  Avatar,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  SwipeableDrawer,
  Typography,
} from "@mui/material";
import React, { cloneElement, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { routesUrls } from "../../routes/urls";
import { getThisKeyCookie, removeThisKeyCookie } from "../../utils/Cookies";
import {
  DividerComponent,
  Enums,
  GridContainer,
  GridItem,
  primary,
} from "../../utils/Helper";

export const handleLogout = (navigate) => {
  removeThisKeyCookie(Enums.cookiesKeys.MEMBER_ID);
  removeThisKeyCookie(Enums.cookiesKeys.MEMBER_NAME);
  removeThisKeyCookie(Enums.cookiesKeys.USER_ID);
  removeThisKeyCookie(Enums.cookiesKeys.JWT_TOKEN);
  removeThisKeyCookie(Enums.cookiesKeys.EXPIRY_DATE_TIME);
  removeThisKeyCookie(Enums.cookiesKeys.PROFILE_PHOTO);
  navigate("/login");
};

export default function Navbar({ children }) {
  const navigate = useNavigate();
  const [sideMenu, setSideMenu] = useState({
    open: false,
  });
  // handleOpenMenu
  const handleOpenMenu = () => {
    setSideMenu((prev) => ({ ...prev, open: true }));
  };
  // handleCloseMenu
  const handleCloseMenu = () => {
    setSideMenu((prev) => ({ ...prev, open: false }));
  };

  const menuItems = [
    {
      icon: <PersonIcon />,
      label: "Profile",
      onClick: () => {
        navigate(routesUrls.PROFILE);
      },
    },
    {
      icon: <Diversity3Icon />,
      label: "Friends",
      onClick: () => {
        navigate(routesUrls.FRIENDS);
      },
    },
    {
      icon: <PaymentIcon />,
      label: "Expenses",
      onClick: () => {
        navigate(routesUrls.EXPENSES);
      },
    },
    {
      icon: <AccountBalanceIcon />,
      label: "Accounts",
      onClick: () => {
        navigate(routesUrls.ACCOUNTS);
      },
    },
    {
      icon: <SettingsIcon />,
      label: "Settings",
      onClick: () => {
        navigate(routesUrls.SETTINGS);
      },
    },
    {
      icon: <LogoutIcon />,
      label: "Logout",
      onClick: () => {
        handleLogout(navigate);
      },
    },
  ];

  return (
    <>
      <Box
        className={"flex_between"}
        px={{ xs: 1, md: 7.5 }}
        my={{ xs: 1, md: 2 }}
      >
        <Link to={"/"} style={{ textDecoration: "none" }}>
          <Box
            component={"img"}
            src={logo}
            width={"100%"}
            maxWidth={{ xs: 80, md: 120 }}
          />
        </Link>
        <Box className={"flex_between"} gap={{ xs: 0.5, md: 2 }}>
          <>
            <Avatar
              src={getThisKeyCookie(Enums.cookiesKeys.PROFILE_PHOTO)}
              sx={{ width: { xs: 30, md: 40 }, height: { xs: 30, md: 40 } }}
            />
            <Typography variant="h4" color={primary}>
              {getThisKeyCookie(Enums.cookiesKeys.MEMBER_NAME)}
            </Typography>
          </>

          <IconButton onClick={handleOpenMenu}>
            <MenuIcon fontSize="medium" color="primary" />
          </IconButton>
        </Box>
      </Box>
      <main>{children}</main>
      <footer>
        <GridContainer>
          <GridItem md={12} mt={4}>
            <DividerComponent />
          </GridItem>
          <GridItem md={12} textAlign={"center"}>
            <Typography variant="h6" color={primary} pb={1}>
              Eabha All Rights Reserved, {new Date().getFullYear()}.
            </Typography>
          </GridItem>
        </GridContainer>
      </footer>

      {/* side Menu */}
      <SwipeableDrawer
        anchor={"right"}
        open={sideMenu.open}
        onClose={handleCloseMenu}
        onOpen={handleOpenMenu}
        sx={{
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: { xs: 200, md: 400 },
          },
        }}
      >
        <Box
          component={"img"}
          src={logo}
          width={"100%"}
          maxWidth={{ xs: 80, md: 100 }}
          p={2}
        />
        <List>
          {menuItems.map((menu_i, index) => (
            <ListItem
              disablePadding
              onClick={() => {
                menu_i.onClick();
                handleCloseMenu();
              }}
              key={index}
            >
              <ListItemButton>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {cloneElement(menu_i.icon, {
                    fontSize: "small",
                    color: "primary",
                  })}
                </ListItemIcon>
                <ListItemText
                  primary={menu_i.label}
                  color="primary"
                  primaryTypographyProps={{
                    color: primary,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </SwipeableDrawer>
    </>
  );
}
