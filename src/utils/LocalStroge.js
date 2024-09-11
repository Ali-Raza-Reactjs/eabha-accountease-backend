export const setThisKeyLocalStorage = (key, value) => {
  localStorage.setItem(key, value);
};

/* ------------------------------  GET LocalStorage DATA FUNCTION  -------------------------------- */
export const getThisKeyLocalStorage = (key) => {
  return localStorage.getItem(key);
};
/* ------------------------------  REMOVE COOKIE DATA FUNCTION  -------------------------------- */
export const removeThisKeyLocalStorage = (key) => {
  return localStorage.removeItem(key);
};
