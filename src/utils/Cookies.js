import Cookies from "js-cookie";
import { Enums } from "./Helper";

/* ------------------------------  SET COOKIE DATA FUNCTION  -------------------------------- */
export const setThisKeyCookie = (key, value) => {
  Cookies.set(key, value);
};

/* ------------------------------  GET COOKIE DATA FUNCTION  -------------------------------- */
export const getThisKeyCookie = (key) => {
  return Cookies.get(key);
};
/* ------------------------------  REMOVE COOKIE DATA FUNCTION  -------------------------------- */
export const removeThisKeyCookie = (key) => {
  return Cookies.remove(key);
};
export const isAuthenticated = () => {
  if (getThisKeyCookie(Enums.cookiesKeys.JWT_TOKEN)) {
    return true;
  } else {
    return false;
  }
};
