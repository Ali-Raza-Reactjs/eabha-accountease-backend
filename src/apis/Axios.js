import axios from "axios";
import { Enums } from "../utils/Helper.js";
import { getThisKeyCookie } from "../utils/Cookies.js";

let baseURL = "";
if (process.env.NODE_ENV === "development") {
  baseURL = `${process.env.REACT_APP_PROD_BASEURL}`;
  baseURL = `${process.env.REACT_APP_DEV_BASEURL}`;
} else if (process.env.NODE_ENV === "production") {
  baseURL = `${process.env.REACT_APP_PROD_BASEURL}`;
}
export const Axios = axios.create({
  baseURL: baseURL,
});
Axios.interceptors.request.use(
  async (config) => {
    const token = getThisKeyCookie(Enums.cookiesKeys.JWT_TOKEN);
    if (token) {
      config.headers["Authorization"] = "Bearer " + token; // for Spring Boot back-end
      config.headers["x-access-token"] = token; // for Node.js Express back-end
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
export const Login = (username, password) => {
  const body = {
    username,
    password,
  };
  return axios.post(`${baseURL}/signin`, body, { withCredentials: true });
};

export const CreatePaymentHistory = (
  paymentMonth,
  paymentDate,
  paymentMethodId,
  paymentStatusId,
  paymentAmount,
  comment,
  memberId
) => {
  const body = {
    paymentMonth,
    paymentDate,
    paymentMethodId,
    paymentStatusId,
    paymentAmount,
    comment,
    memberId,
  };
  return Axios.post(`${baseURL}/create-payment-history`, body);
};

export const GetTotalAmount = (
  paymentMethodId,
  paymentMonth,
  history = false
) => {
  const body = {
    paymentMethodId,
    paymentMonth,
    history: history,
  };
  return Axios.post(`${baseURL}/get-total-amount`, body, {
    auth: "",
  });
};
export const UpdatePassword = (userId, oldPassword, newPassword, token) => {
  const body = { userId, oldPassword, newPassword };
  return Axios.post(`${baseURL}/update-password`, body);
};
export const ResetPassword = (userId, newPassword, token) => {
  const body = { userId, newPassword };
  return axios.post(`${baseURL}/update-password`, body, {
    headers: {
      Authorization: "Bearer " + token,
      "x-access-token": token,
    },
  });
};
export const UpdateProfile = (body) => {
  return Axios.post(`${baseURL}/update-profile`, body, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const UpdatePaymentStatus = (paymentId, paymentStatusId) => {
  const body = { paymentId, paymentStatusId };
  return Axios.post(`${baseURL}/update-payment-status`, body);
};
export const GetMembersData = (memberId) => {
  const body = {
    memberId,
  };
  return Axios.post(`${baseURL}/get-members-data`, body);
};

export const GetTransactionTypes = () => {
  return Axios.get(`${baseURL}/transaction/getTransactionTypes`);
};

export const AddTransaction = (
  date,
  amount,
  type,
  category,
  comment,
  isReceivable,
  payLoan
) => {
  const body = {
    date,
    amount,
    type,
    category,
    comment,
    isReceivable,
    payLoan,
  };
  return Axios.post(`${baseURL}/transaction/addTransaction`, body);
};
export const GetTransactionCategories = () => {
  return Axios.get(`${baseURL}/getTransactionCategories`);
};
export const GetSingleMemberData = (id) => {
  return Axios.get(`${baseURL}/get-single-member-data/${id}`);
};
export const GetAllMembers = () => {
  return Axios.get(`${baseURL}/getAllMembers`);
};
export const DeleteTransaction = (id) => {
  return Axios.delete(`${baseURL}/transaction/deleteTransaction/${id}`);
};
export const AddExpense = (
  groupId,
  expenseDate,
  description,
  expenseAmount,
  paidMemberDetails,
  splitMemberDetails
) => {
  const body = {
    groupId,
    expenseDate,
    description,
    expenseAmount,
    paidMemberDetails,
    splitMemberDetails,
  };
  return Axios.post(`${baseURL}/expense/addGroupMembersExpenses`, body);
};
export const UpdateExpense = (
  expenseId,
  groupId,
  expenseDate,
  description,
  expenseAmount,
  paidMemberDetails,
  splitMemberDetails
) => {
  const body = {
    expenseId,
    groupId,
    expenseDate,
    description,
    expenseAmount,
    paidMemberDetails,
    splitMemberDetails,
  };
  return Axios.post(`${baseURL}/expense/updateGroupMembersExpenses`, body);
};
export const DeleteExpense = (id) => {
  return Axios.delete(`${baseURL}/expense/deleteExpense/${id}`);
};

export const UpdateTransaction = (
  transactionId,
  date,
  amount,
  type,
  additionalType,
  category,
  comment
) => {
  const body = {
    transactionId,
    date,
    amount,
    type,
    additionalType,
    category,
    comment,
  };
  return Axios.post(`${baseURL}/transaction/updateTransaction`, body);
};
export const GetMemberExpenses = () => {
  return Axios.get(`${baseURL}/getMemberExpenses`);
};
export const GetMemberTransactionDetails = (
  createdFrom,
  createdTo,
  type,
  categories
) => {
  const body = {
    createdFrom,
    createdTo,
    type,
    categories,
  };
  return Axios.post(`${baseURL}/transaction/getMemberTransactionDetails`, body);
};
export const GetAllExpenses = (createdFrom, createdTo, memberId) => {
  const body = {
    createdFrom,
    createdTo,
    memberId,
  };
  return Axios.post(`${baseURL}/getAllExpenses`, body);
};
export const ReceivedAmount = (
  groupId,
  receivedDate,
  fromMemberId,
  receivedAmount,
  comment
) => {
  const body = { groupId, receivedDate, fromMemberId, receivedAmount, comment };
  return Axios.post(`${baseURL}/expense/receivedAmout`, body);
};

// --------------------- optimization --------------------

export const GetAmountSum = () => {
  return Axios.get(`${baseURL}/getAmountSum`);
};
export const GetTotalAmountDetails = () => {
  return Axios.get(`${baseURL}/getTotalAmountDetails`);
};
export const GetThisMonthAmountDetails = (id) => {
  return Axios.get(`${baseURL}/getThisMonthAmountDetails/${id}`);
};
export const GetMembersAmountDetails = () => {
  return Axios.get(`${baseURL}/getMembersAmountDetails`);
};
export const GetSingleMembersAmountDetails = (id) => {
  return Axios.get(`${baseURL}/getSingleMembersAmountDetails/${id}`);
};
export const loadMemberExpensesHistory = (memberId, createdFrom, createdTo) => {
  const body = {
    memberId,
    createdFrom,
    createdTo,
  };
  return Axios.post(`${baseURL}/loadMemberExpensesHistory`, body);
};
export const GetMembersExpenseSummary = (createdFrom, createdTo, memberId) => {
  const body = {
    createdFrom,
    createdTo,
    memberId,
  };
  return Axios.post(`${baseURL}/getMembersExpenseSummary`, body);
};
export const GetReceivedHistory = (createdFrom, createdTo, id) => {
  const body = {
    createdFrom,
    createdTo,
    id,
  };
  return Axios.post(`${baseURL}/getReceivedHistory`, body);
};
export const sendOTP = (email) => {
  const body = {
    email,
  };
  return Axios.post(`${baseURL}/send-otp`, body);
};
export const Signup = (body) => {
  return Axios.post(`${baseURL}/signup`, body);
};
export const SendSignupVerificationOtp = (userId) => {
  const body = {
    userId,
  };
  return Axios.post(`${baseURL}/sendSignupVerificationOtp`, body);
};
export const VerifySignupOtp = (userId, otp) => {
  const body = {
    userId,
    otp,
  };
  return Axios.post(`${baseURL}/verifySignupOtp`, body);
};
export const GetMemberUsingEmail = (email) => {
  return Axios.get(`${baseURL}/member/getMemberUsingEmail/${email}`);
};
export const GetAllMembersForAddGroup = (groupId) => {
  return Axios.get(`${baseURL}/member/getAllMembersForAddGroup/${groupId}`);
};
export const AddFriends = (friends) => {
  const body = { friends };
  return Axios.post(`${baseURL}/friend/addFriends`, body);
};
export const AddGroup = (body) => {
  return Axios.post(`${baseURL}/group/addGroup`, body);
};
export const UpdateGroup = (body) => {
  return Axios.post(`${baseURL}/group/updateGroup`, body);
};
export const DeleteGroup = (id) => {
  return Axios.delete(`${baseURL}/group/deleteGroup/${id}`);
};
export const GetAllGroups = () => {
  return Axios.get(`${baseURL}/group/getAllGroups`);
};
export const GetFriends = () => {
  return Axios.get(`${baseURL}/friend/getFriends`);
};
export const DeleteFriend = (id) => {
  return Axios.delete(`${baseURL}/friend/deleteFriend/${id}`);
};
export const GetGroupMembersExpenses = (id) => {
  return Axios.get(`${baseURL}/expense/getGroupMembersExpenses/${id}`);
};
export const GetExpenses = (groupId, createdFrom, createdTo, memberId) => {
  const body = {
    groupId,
    createdFrom,
    createdTo,
    memberId,
  };
  return Axios.post(`${baseURL}/expense/getExpenses`, body);
};
