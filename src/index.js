import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { BrowserRouter as Router } from "react-router-dom";
import { primary, red } from "./utils/Helper";

let theme = createTheme({
  overrides: {
    MuiFormLabel: {
      asterisk: {
        color: "#db3131", // Red color for required asterisk
      },
    },
  },
  palette: {
    primary: {
      main: "#282478",
    },
    secondary: {
      main: "#34afcf",
      dark: "#029bc4",
    },
    error: {
      main: red,
    },
  },
  typography: {
    fontFamily: "'Lato Regular', 'Inter Regular', 'Arial' !important",
    lineHeight: "1px",
    h2: {
      fontSize: 26,
      fontWeight: 600,
      color: primary,
    },
    h3: {
      fontSize: 24,
      fontWeight: 600,
      color: primary,
    },
    h4: {
      fontSize: 20,
      fontWeight: 600,
      color: primary,
    },
    h6: {
      fontSize: 14,
      fontWeight: 500,
      color: primary,
    },
    body1: {
      fontSize: 12,
      fontWeight: 300,
      color: primary,
    },
    button: {
      textTransform: "none",
      fontSize: 16,
    },
  },
});
theme.typography.h2 = {
  fontSize: "1.625rem",
  [theme.breakpoints.down("md")]: {
    fontSize: "1.25rem",
  },
};
theme.typography.h3 = {
  fontSize: "1.5rem",
  [theme.breakpoints.down("md")]: {
    fontSize: "1rem",
  },
};
theme.typography.h4 = {
  fontSize: "1.25rem",
  [theme.breakpoints.down("md")]: {
    fontSize: "1rem",
  },
};
theme.typography.h6 = {
  fontSize: "0.875rem",
  [theme.breakpoints.down("md")]: {
    fontSize: "0.75rem",
  },
};
theme.typography.button = {
  fontSize: "1rem",
  [theme.breakpoints.down("md")]: {
    fontSize: "0.75rem",
  },
};
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ThemeProvider theme={theme}>
    <Router>
      <App />
    </Router>
  </ThemeProvider>
);
