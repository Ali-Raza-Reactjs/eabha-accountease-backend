import DeleteIcon from "@mui/icons-material/Delete";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import HistoryIcon from "@mui/icons-material/History";
import InfoIcon from "@mui/icons-material/Info";
import PriceCheckIcon from "@mui/icons-material/PriceCheck";
import SummarizeIcon from "@mui/icons-material/Summarize";
import SyncIcon from "@mui/icons-material/Sync";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
  timelineContentClasses,
  timelineOppositeContentClasses,
} from "@mui/lab";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  ClickAwayListener,
  DialogContent,
  DialogContentText,
  Divider,
  Fade,
  FormControlLabel,
  Grid,
  Grow,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Popper,
  Skeleton,
  Snackbar,
  Switch,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { AES, enc } from "crypto-js";
import moment from "moment";
import "moment-timezone";
import {
  cloneElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Circles } from "react-loader-spinner";
import { useLocation, useNavigate } from "react-router-dom";
import {
  GetAllExpenses,
  GetAllGroups,
  GetAllMembers,
  GetAllMembersForAddGroup,
  GetFriends,
  GetMemberExpenses,
  GetTransactionCategories,
  GetTransactionTypes,
} from "../apis/Axios";
import MyButton from "../components/Buttons/MyButton";
import DeleteModalComponent from "../components/Modals/DeleteModal";
import MyTextField from "../components/TextField/MyTextField";
import MyTextFieldLabel from "../components/TextField/MyTextFieldLabel";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// primary
export const primary = "#282478";
// secondary
export const secondary = "#029bc4";
export const green = "#00C938";
export const red = "#F94141";
export const yellow = "#FF9900";
export const purple = "#0000FF";
export const disabled = "rgba(0, 0, 0, 0.12)";
export const grey = "rgb(0 0 0 / 53%)";
// pagePadding
export const pagePadding = { xs: 1, md: 7.5 };
// pageGridSpacing
export const pageGridSpacing = { xs: 1, md: 3 };

// textTrucate
export function textTrucate(truncateText, maxWidth = "200px") {
  if (truncateText) {
    return (
      <Tooltip title={truncateText}>
        <span
          className="d-inline-block text-truncate"
          style={{ maxWidth: maxWidth }}
        >
          {truncateText}
        </span>
      </Tooltip>
    );
  }
}
// Enums
export const Enums = Object.freeze({
  paymentMethodLookUp: [
    {
      id: 1,
      title: "Deposit",
    },
    {
      id: 2,
      title: "Withdraw",
    },
  ],
  paymentMethodIds: {
    Deposit: 1,
    Withdraw: 2,
  },
  paymentMethodName: {
    1: "Deposit",
    2: "Withdraw",
  },
  paymentStatusLookUp: [
    {
      id: 1,
      title: "Approved",
    },
    {
      id: 2,
      title: "Pending Approval",
    },
  ],
  paymentStatusIds: {
    Approved: 1,
    PendingApproval: 2,
  },
  paymentStatusNames: {
    1: "Approved",
    2: "Pending Approval",
  },
  transactionTypesIds: {
    RECEIVED: 1,
    RECEIVABLE: 2,
    SPENT: 3,
    GIVE_A_LOAN: 4,
    TAKE_A_LOAN: 5,
    REPAY_A_LOAN: 6,
  },
  transactionCategoriesIds: {
    GENERAL: 1,
    HOME: 2,
    UTILITY_BILL: 3,
    FOOD: 4,
    TRAVELIING: 5,
    FUEL: 6,
    PERSONAL: 7,
  },
  members: {
    ALI_RAZA: 1,
    EHTISHAM_GOHAR: 2,
    MUHAMMAD_AHMAD: 3,
    MUHAMMAD_BILAL: 4,
    MUHAMMAD_HAMZA: 5,
  },
  membersName: {
    1: "Ali Raza",
    2: "Ehtisham Gohar",
    3: "Muhammad Ahmad ",
    4: "Muhammad Bilal",
    5: "Muhammad Hamza",
  },
  cookiesKeys: {
    MEMBER_ID: "memberId",
    MEMBER_NAME: "memberName",
    MEMBER_EMAIL: "memberEmail",
    PROFILE_PHOTO: "profilePhoto",
    USER_ID: "userId",
    JWT_TOKEN: "jwt",
    EXPIRY_DATE_TIME: "expiryDateTime",
  },
  whatsappMsgs: {
    DEPOSIT_MONEY: `Please approve my deposit form on ${window.location.href}.`,
    WITHDRAW_MONEY: `Please approve my withdraw form on ${window.location.href}.`,
  },
  splitTypeOptions: [
    { value: 1, label: "Equally" },
    { value: 2, label: "Partially" },
    { value: 3, label: "Proportionally" },
  ],

  splitTypeIds: {
    EQUALLY: 1,
    PARTIALLY: 2,
    PROPORTIONALLY: 3,
  },
});

// currentDate
export const currentDate = () => {
  return moment().format("YYYY-MM-DD");
};
// dateTimeFormat
export function currentDateTime() {
  return moment().format("YYYY-MM-DDTHH:mm");
}
export function dateTimeFormat(DateTime) {
  if (DateTime) {
    return moment(DateTime).format("YYYY-MM-DDTHH:mm");
  }
}
// timeFormat
export function timeFormat(time) {
  if (time) {
    return moment(time).format("hh:mm A");
  }
}
// currentDate
export const getDay = (date) => {
  return moment(date).format("dddd");
};
// currentDate
export const dateFormat = (date) => {
  return moment(date).format("DD-MM-YYYY");
};
// currentDate
export const dateFormatForInput = (date) => {
  return moment(date).format("YYYY-MM-DD");
};
// currentDate
export const dateTimeFormatUtc = (utcTime) => {
  return moment.utc(utcTime).tz("Asia/Karachi").format("DD-MM-YYYY hh:mm A");
};
// currentMonth
export const currentMonth = () => {
  return moment().format("YYYY-MM");
};
// monthFormat
export const monthFormat = (month) => {
  if (month) {
    return moment(month, "YYYY-MM").format("MMMM YYYY");
  }
};

export const fetchMethod = async (
  method,
  setLoading = () => {},
  hasLoadingObj = true,
  loadingName = "loading"
) => {
  let response = {};
  hasLoadingObj
    ? setLoading((prev) => ({ ...prev, [loadingName]: true }))
    : setLoading(true);
  await method()
    .then((res) => {
      response = res.data;
    })
    .catch((err) => {
      response = { status: false };
      console.log(err);
    })
    .finally(() => {
      hasLoadingObj
        ? setLoading((prev) => ({ ...prev, [loadingName]: false }))
        : setLoading(false);
    });
  return { response: response };
};

export const useSnackbar = () => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "",
    message: "",
  });

  const showSuccessSnackbar = (message) => {
    setSnackbar({ open: true, severity: "success", message: message });
  };
  const showErrorSnackbar = (message) => {
    setSnackbar({ open: true, severity: "error", message: message });
  };
  return { snackbar, setSnackbar, showSuccessSnackbar, showErrorSnackbar };
};

const NotificationSnackbar = ({ snackbar, handleSnackbarClose }) => {
  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={5000}
      onClose={handleSnackbarClose}
    >
      <Alert
        onClose={handleSnackbarClose}
        severity={snackbar.severity}
        sx={{ width: "100%" }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
};
// SnackBarComponent
export const SnackBarComponent = ({ data }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "",
    message: "",
  });
  //  snack bar
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    const { open, severity, message } = data;
    setSnackbar({ open, severity, message });
  }, [data]);
  return (
    <NotificationSnackbar
      snackbar={snackbar}
      handleSnackbarClose={handleSnackbarClose}
    />
  );
};

// NavigateSnackbar
export const NavigateSnackbar = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "",
    message: "",
  });
  // handleSnackbarClose
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };
  useEffect(() => {
    if (state) {
      setSnackbar({
        open: state.open,
        message: state.msg,
        severity: state.type,
      });
    }
    const timer = setTimeout(() => {
      navigate({
        state: { open: false },
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [state]);
  return (
    <>
      <NotificationSnackbar
        snackbar={snackbar}
        handleSnackbarClose={handleSnackbarClose}
      />
    </>
  );
};

// monthYearFormat
export function monthYearFormat(monthYear) {
  if (monthYear) {
    return moment(monthYear, "YYYY-MM").format("MMMM YYYY");
  }
}

export const useGetTransactionTypes = () => {
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  // handleGetAllTransactionTypes
  const handleGetAllTransactionTypes = async () => {
    const { response } = await fetchMethod(
      GetTransactionTypes,
      setLoading,
      false
    );
    console.log(response);
    if (response.status) {
      setTransactionTypes(response.data);
    }
  };
  useEffect(() => {
    handleGetAllTransactionTypes();
  }, []);
  return { transactionTypes, loading };
};
export const useGetTransactionCategories = () => {
  const [transactionCategories, setTransactionCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // handleGetAllTransactionCategories
  const handleGetAllTransactionCategories = async () => {
    const { response } = await fetchMethod(
      GetTransactionCategories,
      setLoading,
      false
    );
    if (response.status) {
      setTransactionCategories(response.data);
    }
  };
  useEffect(() => {
    handleGetAllTransactionCategories();
  }, []);
  return { transactionCategories, loading };
};

export const useGetAllMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  // handleGetAllAllMembers
  const handleGetAllAllMembers = async () => {
    const { response } = await fetchMethod(GetAllMembers, setLoading, false);
    if (response.status) {
      setMembers(response.data);
    }
  };
  useEffect(() => {
    handleGetAllAllMembers();
  }, []);
  return { members, loading };
};
export const useGetAllFriendsOrByGroupId = (groupId) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);

  // handleGetAllFriends
  const handleGetAllFriends = async () => {
    const { response } = await fetchMethod(GetFriends, setLoading, false);
    if (response.status) {
      setFriends(response.data);
    }
  };
  useEffect(() => {
    handleGetAllFriends();
  }, []);
  return { friends, loading };
};
export const useGetAllMembersForAddGroup = (groupId) => {
  const [membersForAddGroup, setMembersAddGroup] = useState([]);
  const [loading, setLoading] = useState(false);

  // handleGetAllMembersForAddGroup
  const handleGetAllMembersForAddGroup = async () => {
    const { response } = await fetchMethod(
      () => GetAllMembersForAddGroup(groupId),
      setLoading,
      false
    );
    if (response.status) {
      setMembersAddGroup(response.data);
    }
  };
  useEffect(() => {
    handleGetAllMembersForAddGroup();
  }, []);
  return { membersForAddGroup, loading };
};
export const useGetAllGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  // handleGetAllGroups
  const handleGetAllGroups = async () => {
    const { response } = await fetchMethod(GetAllGroups, setLoading, false);
    if (response.status) {
      setGroups(response.data);
    }
  };
  useEffect(() => {
    handleGetAllGroups();
  }, []);
  return { groups, loading };
};
export const useGetMemberExpenses = (dependcies) => {
  const [membersExpenses, setMembersExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  // handleGetMemberExpenses
  const handleGetMemberExpenses = async () => {
    const { response } = await fetchMethod(
      GetMemberExpenses,
      setLoading,
      false
    );
    if (response.status) {
      setMembersExpenses(response.data);
    }
  };
  useEffect(() => {
    handleGetMemberExpenses();
  }, [...dependcies]);
  return { membersExpenses, loading };
};
export const useGetExpenses = (dependcies = []) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  // handleGetExpenses
  const handleGetExpenses = async () => {
    const { response } = await fetchMethod(GetAllExpenses, setLoading, false);
    if (response.status) {
      setExpenses(response.data);
    }
  };
  useEffect(() => {
    handleGetExpenses();
  }, [...dependcies]);
  return { expenses, loading };
};

// clearFilterOptions
export const clearFilterOption = (value = "") => {
  return <MenuItem value={value}>Clear Filter</MenuItem>;
};
// getOptions
export const getOptions = (options) => {
  return {
    paymentMethods: options.map((opt) => {
      return (
        <MenuItem value={opt.paymentMethodId} key={opt.paymentMethodId}>
          {opt.paymentMethodName}
        </MenuItem>
      );
    }),
    paymentStatuses: options.map((opt) => {
      return (
        <MenuItem value={opt.paymentStatusId} key={opt.paymentStatusId}>
          {opt.paymentStatusName}
        </MenuItem>
      );
    }),
    installmentStatuses: options.map((opt) => {
      return (
        <MenuItem value={opt.installmentStatusId} key={opt.installmentStatusId}>
          {opt.installmentStatusName}
        </MenuItem>
      );
    }),
    members: options.map((opt) => {
      return (
        <MenuItem value={opt._id} key={opt._id}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Avatar sx={{ width: 30, height: 30 }} src={opt.profilePhoto} />
            {opt.name}
          </Box>
        </MenuItem>
      );
    }),
    friends: options.map((opt) => {
      return (
        <MenuItem value={opt._id} key={opt._id}>
          <Box>
            <Member
              src={opt.profile}
              name={`${opt.firstName} ${opt.lastName}`}
              email={opt.email}
            />
          </Box>
        </MenuItem>
      );
    }),
    groupMembers: options.map((opt) => {
      return (
        <MenuItem value={opt._id} key={opt._id}>
          <Box>
            <Member
              src={opt.profile}
              name={` ${
                opt.firstName ? `${opt.firstName}  ${opt.lastName}` : opt.name
              }`}
            />
          </Box>
        </MenuItem>
      );
    }),
    transactionTypes: options.map((opt) => {
      return (
        <MenuItem value={opt.transactionTypeId} key={opt.transactionTypeId}>
          {opt.transactionTypeName}
        </MenuItem>
      );
    }),
    transactionCategories: options.map((opt) => {
      return (
        <MenuItem
          value={opt.transactionCategoryId}
          key={opt.transactionCategoryId}
        >
          {opt.transactionCategoryName}
        </MenuItem>
      );
    }),
    splitTypes: options.map((opt) => {
      return (
        <MenuItem value={opt.value} key={opt.value}>
          {opt.label}
        </MenuItem>
      );
    }),
  };
};

export const useMenuForLoop = () => {
  const [openElem, setOpenElem] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const handleOpen = (event, elem) => {
    event.stopPropagation();
    if (event.currentTarget === anchorEl) {
      setAnchorEl(null);
      setOpenElem(null);
      return;
    }
    setAnchorEl(event.currentTarget);
    setOpenElem(elem);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setOpenElem(null);
  };
  return { anchorEl, openElem, handleOpen, handleClose };
};
export const useMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return { anchorEl, open, handleOpen, handleClose };
};

export const MenuComponent = (props) => {
  const { anchorEl, open, onClose, children } = props;
  return (
    <Menu
      id="fade-menu"
      MenuListProps={{
        "aria-labelledby": "fade-button",
      }}
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      TransitionComponent={Fade}
      disableElevation
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
    >
      <Box px={1}>{children}</Box>
    </Menu>
  );
};

// GridContainer
export const GridContainer = ({
  xs = 12,
  sm,
  md,
  lg,
  xl,
  spacing = { xs: 1, md: 3 },
  children,
  ...others
}) => {
  return (
    <Grid
      item
      xs={xs}
      sm={sm}
      md={md}
      lg={lg}
      xl={xl}
      container
      spacing={spacing}
      {...others}
    >
      {children}
    </Grid>
  );
};
// GridItem
export const GridItem = ({
  xs = 12,
  sm,
  md = 6,
  lg,
  xl,
  children,
  ...others
}) => {
  return (
    <Grid item xs={xs} sm={sm} md={md} lg={lg} xl={xl} {...others}>
      {children}
    </Grid>
  );
};

// encryptData
export function encryptData(data) {
  // Encrypt the number by converting it to a string
  const encryptedData = data
    ? AES.encrypt(String(data), process.env.REACT_APP_SECRET_KEY).toString()
    : "";

  return encryptedData;
}
// decryptData
export function decryptData(data) {
  // Decrypt the string by converting it to a number
  const decryptedData = data
    ? AES.decrypt(data, process.env.REACT_APP_SECRET_KEY).toString(enc.Utf8)
    : "";
  return decryptedData;
}

export const DividerComponent = () => {
  return (
    <>
      <Divider
        sx={{
          border: "1px solid rgba(30, 30, 30, 0.1);",
          opacity: 1,
        }}
      />
    </>
  );
};

export const useDelete = (
  deletetMethod,
  setSnackbar = () => {},
  getMethod = () => {}
) => {
  // delete modal
  const initialDeleteModalFields = {
    open: false,
    name: "",
    loading: false,
    id: null,
  };
  const [deleteData, setDeleteData] = useState(initialDeleteModalFields);
  // handleDeleteClose
  const handleDeleteClose = () => {
    setDeleteData(initialDeleteModalFields);
  };
  // handleDelete
  const handleDelete = async () => {
    setDeleteData((prev) => ({ ...prev, loading: true }));
    console.log(deleteData.id);
    await deletetMethod(deleteData.id)
      .then((res) => {
        const response = res.data;
        if (response.status) {
          handleDeleteClose();
          getMethod();
          setSnackbar({
            open: true,
            severity: "success",
            message: "Successfully Deleted",
          });
        } else {
          setSnackbar({
            open: true,
            severity: "error",
            message: response.msg,
          });
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setDeleteData((prev) => ({ ...prev, loading: false }));
      });
  };
  return { deleteData, setDeleteData, handleDeleteClose, handleDelete };
};

export const DeleteModal = ({ data, onClose, handleDelete, deleteDetails }) => {
  return (
    <DeleteModalComponent
      deleteDetails={deleteDetails}
      open={data.open}
      onClose={onClose}
      loading={data.loading}
      deleteName={data.name}
      handleDelete={handleDelete}
    />
  );
};

export const useForm = (setSubmitData) => {
  const [errors, setErrors] = useState([]);
  // handleInvalid
  const handleInvalid = (e) => {
    setErrors([...errors, e.target.name]);
  };
  // handleFilterError
  const handleFilterError = (e, _name) => {
    const name = e ? e.target.name : _name;
    if (errors.includes(name)) {
      let newerrors = errors.filter((er) => er !== name);
      setErrors(newerrors);
    }
  };
  // handleRefocus
  const handleRefocus = (e, _name) => {
    const name = e ? e.target.name : _name;
    if (errors.includes(name)) {
      let newerrors = errors.filter((er) => er !== name);
      setErrors(newerrors);
    }
  };

  const handleChange = (e) => {
    handleFilterError(e);
    setSubmitData((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.value.length === 1
          ? e.target.value.trim().length === 1
            ? e.target.value
            : ""
          : e.target.value,
    }));
  };

  const handleChangeMutipleSelect = (e) => {
    handleFilterError(e);
    const { name, value } = e.target;
    if (value.includes("")) {
      setSubmitData((prev) => ({ ...prev, [name]: [] }));
      return;
    }
    setSubmitData((prev) => ({
      ...prev,
      [name]: e.target.value,
    }));
  };

  return {
    errors,
    handleInvalid,
    handleChange,
    handleChangeMutipleSelect,
    setErrors,
    handleRefocus,
  };
};
export const useRefForm = () => {
  const [errors, setErrors] = useState([]);
  // handleInvalid
  const handleInvalid = (e) => {
    setErrors([...errors, e.target.name]);
  };

  // handleFilterError
  const handleFilterError = (e, _name) => {
    const name = e ? e.target.name : _name;
    let newerrors = errors.filter((er) => er !== name);
    setErrors(newerrors);
  };

  const refData = useRef({});
  const inputRef = (name) => (el) => {
    if (el) {
      refData.current[name] = el.value;
    }
  };
  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    refData.current[name] = value;
  };

  return {
    errors,
    refData,
    inputRef,
    setErrors,
    handleChange,
    handleInvalid,
    handleFilterError,
  };
};
// useShowPassword;
export const useShowPassword = () => {
  const [showPassword, setShowPassword] = useState(false);

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return { showPassword, handleShowPassword };
};

export const CicrlesLoading = ({ height = "90vh" }) => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("md"));
  return (
    <Box className={"flex_center"} height={height} width={"100%"}>
      <Circles
        type="Circles"
        width={matches ? 100 : 168}
        height={matches ? 100 : 168}
        color={primary}
      />
    </Box>
  );
};

export const TableRowsLoader = ({ rowsNum = 5, columnsNum = 5 }) => {
  return [...Array(rowsNum)].map((row, index) => (
    <TableRow key={index}>
      {[...Array(columnsNum)].map((col, col_index) => (
        <TableCell component="th" scope="row" key={col_index}>
          <Skeleton animation="wave" variant="text" />
        </TableCell>
      ))}
    </TableRow>
  ));
};

export const showErrors = (errors, setSnackbar) => {
  for (const key in errors) {
    if (errors.hasOwnProperty(key)) {
      const errorMessages = errors[key];
      setSnackbar({
        open: true,
        message: `${key}: ${errorMessages}`,
        severity: "error",
      });
    }
  }
};

export const SwitchComponent = ({
  label = "Update Mode",
  checked,
  onChange,
  labelPlacement = "start",
  color = "#fff",
  showLabel = true,
  ...others
}) => {
  return (
    <FormControlLabel
      sx={{
        m: 0,
      }}
      control={
        <Switch
          color="primary"
          size="small"
          checked={checked}
          onChange={onChange}
        />
      }
      label={
        showLabel && (
          <Typography variant="h6" color={color}>
            {label}
          </Typography>
        )
      }
      labelPlacement={labelPlacement}
      {...others}
    />
  );
};
export const TwoSidedSwitchComponent = ({ checked, onChange }) => {
  return (
    <Box className={"flex_center"}>
      <MyTextFieldLabel title={"Receivable"} required={false} color={yellow} />
      <Switch value={checked} checked={checked} onChange={onChange} />
      <MyTextFieldLabel title={`Received`} required={false} color={green} />
    </Box>
  );
};

export const PageMainBox = ({ children, ...others }) => {
  return (
    <Box px={pagePadding} mt={pageGridSpacing} {...others}>
      {children}
    </Box>
  );
};
export const LoadingTextField = () => {
  return <MyTextField value={"loading..."} inputProps={{ readOnly: true }} />;
};

export const PageHeaderButton = ({ title, onClick }) => {
  return (
    <MyButton
      title={title}
      p={{ xs: 2, md: "19px 50px !important" }}
      height={{ xs: 34, md: 51 }}
      onClick={onClick}
    />
  );
};

export function CheckboxComponent({
  label,
  name,
  value,
  onChange,
  checked,
  required = false,
  labelPlacement,
  disabled = false,
  p = 1,
  height,
}) {
  return (
    <FormControlLabel
      sx={{ margin: 0, height: height }}
      disabled={disabled}
      label={
        <MyTextFieldLabel title={label} required={required} color={primary} />
      }
      labelPlacement={labelPlacement}
      control={
        <Checkbox
          size="small"
          name={name}
          value={value}
          checked={checked}
          sx={{
            padding: `${p} !important`,
            color: !disabled && primary,
            "&.Mui-checked": {
              color: !disabled && primary,
            },
          }}
          onChange={onChange}
        />
      }
    />
  );
}

export const Member = ({ variant = "circular", src, name, email }) => {
  return (
    <Box display={"flex"} gap={1} alignItems={"center"}>
      <Avatar
        src={src}
        sx={{
          width: { xs: 30, md: 40 },
          height: { xs: 30, md: 40 },
          border: "1px solid rgba(30, 30, 30, 0.1)",
        }}
        variant={variant}
      />
      <Box>
        <Typography variant="h6" color={"primary"} flexShrink={0}>
          {textTrucate(name, 200 - 38)}
        </Typography>
        <Typography variant="body1" color={grey} flexShrink={0}>
          {textTrucate(email, 200 - 38)}
        </Typography>
      </Box>
    </Box>
  );
};
export const useNavigateSnackbar = () => {
  const navigate = useNavigate();
  const setSuccessNavigationSnackbar = (path, msg) => {
    navigate(path, {
      state: {
        open: true,
        msg: msg,
        type: "success",
      },
    });
  };

  return { setSuccessNavigationSnackbar };
};

export const roundOff = (number) => {
  if (!number) return "0";
  const rounded = Math.round(Number(number) * 100) / 100;
  return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(2);
};

export const DialogContentComp = ({ children, ...others }) => {
  return (
    <DialogContent
      sx={{
        p: { xs: "8px", md: "25px 20px" },
      }}
      {...others}
    >
      {children}
    </DialogContent>
  );
};
export const DialogContentTextComp = ({ children, ...others }) => {
  return (
    <DialogContentText
      id="alert-dialog-description"
      sx={{
        color: "rgba(0, 0, 0, 0.87)",
      }}
    >
      {children}
    </DialogContentText>
  );
};

export const TimeLineComponent = ({ children }) => {
  return (
    <Timeline
      sx={{
        m: 0,
        p: 0,
        [`& .${timelineContentClasses.root}`]: {
          flex: 7,
          padding: 1,
        },
        [`& .${timelineOppositeContentClasses.root}`]: {
          flex: 2,
          padding: 1,
        },
      }}
    >
      {children}
    </Timeline>
  );
};
export const TimeLineItemComponent = ({
  index,
  data,
  TimelineOppositeContentData,
  TimelineContentData,
}) => {
  return (
    <TimelineItem sx={{ minHeight: 34 }}>
      <TimelineOppositeContent fontSize={14} sx={{ pr: 0 }}>
        {TimelineOppositeContentData}
      </TimelineOppositeContent>
      <TimelineSeparator>
        <TimelineDot />
        {index !== data.length - 1 && <TimelineConnector />}
      </TimelineSeparator>
      <TimelineContent sx={{ pr: "0px !important" }}>
        {TimelineContentData}
      </TimelineContent>
    </TimelineItem>
  );
};

export const MyIconButton = (props) => {
  const { onClick, background, color = "primary", loading, icon } = props;
  return (
    <Button
      onClick={onClick}
      color={color}
      sx={{
        width: { xs: 30, md: 40 },
        minWidth: { xs: 30, md: 40 },
        height: { xs: 30, md: 40 },
        borderRadius: "10px",
        background: loading ? disabled : background,
      }}
    >
      {loading ? (
        <CircularProgress size={"100%"} />
      ) : (
        cloneElement(icon, {
          sx: { color: "#fff", fontSize: { xs: 20, md: 25 } },
        })
      )}
    </Button>
  );
};

export const HistoryButton = (props) => {
  return <MyIconButton {...props} icon={<HistoryIcon />} background={yellow} />;
};
export const RecievedMoneyButton = (props) => {
  return <MyIconButton {...props} icon={<PriceCheckIcon />} background={red} />;
};
export const InfoButton = ({ onClick, ...others }) => {
  return (
    <IconButton onClick={onClick} {...others}>
      <InfoIcon color="secondary" fontSize="small" />
    </IconButton>
  );
};
export const BackArrowButton = ({ onClick, ...others }) => {
  return (
    <IconButton onClick={onClick} {...others}>
      <ArrowBackIcon />
    </IconButton>
  );
};
export const SearchIconButton = (onClick) => {
  return (
    <IconButton
      sx={{
        backgroundColor: secondary,
        ":hover": {
          backgroundColor: secondary,
        },
      }}
      onClick={onClick}
    >
      <SearchOutlinedIcon sx={{ color: "#fff" }} />
    </IconButton>
  );
};

export const LoadMoreButton = ({ onClick, loading, ...others }) => {
  return (
    <>
      {loading ? (
        <Box height={36} className={"flex_center"}>
          <CircularProgress size={20} />
        </Box>
      ) : (
        <IconButton onClick={onClick} {...others}>
          <SyncIcon color="primary" fontSize="small" />
        </IconButton>
      )}
    </>
  );
};

export const ViewIconButton = ({ onClick, loading, ...others }) => {
  return (
    <>
      {loading ? (
        <Box height={36} className={"flex_center"}>
          <CircularProgress size={20} />
        </Box>
      ) : (
        <IconButton onClick={onClick} {...others}>
          <VisibilityIcon color="primary" fontSize="small" />
        </IconButton>
      )}
    </>
  );
};

export const centerColumns = { align: "center", headerAlign: "center" };

export const MyPopper = ({
  open,
  handleClose,
  anchorEl,
  children,
  maxWidth,
}) => {
  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      transition
      disablePortal
      sx={{ zIndex: 1200 }}
    >
      {({ TransitionProps, placement }) => (
        <Grow
          {...TransitionProps}
          style={{
            transformOrigin:
              placement === "bottom" ? "center top" : "center bottom",
          }}
        >
          <Paper
            sx={{
              padding: 1,
              boxShadow:
                "rgba(0, 0, 0, 0.2) 0px 5px 5px -3px, rgba(0, 0, 0, 0.14) 0px 8px 10px 1px, rgba(0, 0, 0, 0.12) 0px 3px 14px",
              maxWidth: maxWidth,
            }}
            elevation={0}
          >
            <ClickAwayListener onClickAway={handleClose}>
              {children}
            </ClickAwayListener>
          </Paper>
        </Grow>
      )}
    </Popper>
  );
};
export const PopperComponent = ({
  icon = <InfoIcon />,
  color = "secondary",
  children,
  sx,
}) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  function handleToggle() {
    setOpen((prevOpen) => !prevOpen);
  }
  function handleClose(event) {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  }

  return (
    <>
      <IconButton
        ref={anchorRef}
        aria-owns={open ? "menu-list-grow" : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        sx={sx}
      >
        {cloneElement(icon, {
          fontSize: "small",
          color: color,
        })}
      </IconButton>
      <MyPopper
        open={open}
        anchorEl={anchorRef.current}
        handleClose={handleClose}
      >
        {children}
      </MyPopper>
    </>
  );
};

export const FilterShowHideIconButton = ({ onClick, show = false }) => {
  return (
    <IconButton onClick={onClick}>
      {show ? (
        <FilterAltIcon fontSize="small" color="primary" />
      ) : (
        <FilterAltOffIcon fontSize="small" color="primary" />
      )}
    </IconButton>
  );
};
export const EyeShowHideIconButton = ({ onClick, show = false }) => {
  return (
    <IconButton onClick={onClick}>
      {show ? (
        <VisibilityIcon fontSize="small" color="secondary" />
      ) : (
        <VisibilityOffIcon fontSize="small" color="secondary" />
      )}
    </IconButton>
  );
};

export const DeleteIconButton = ({ onClick }) => {
  return (
    <IconButton onClick={onClick}>
      <DeleteIcon fontSize="small" color="error" />
    </IconButton>
  );
};

export const SummaryIconButton = ({ onClick }) => {
  return (
    <Tooltip title={"Show Summary"}>
      <IconButton onClick={onClick}>
        <SummarizeIcon fontSize="small" color="primary" />
      </IconButton>
    </Tooltip>
  );
};

export const ToggleEyeButton = ({ onClick, show = false }) => {
  return (
    <Tooltip title={"Show Summary"}>
      <IconButton onClick={onClick}>
        {show ? (
          <VisibilityIcon fontSize="small" color="primary" />
        ) : (
          <VisibilityOffIcon fontSize="small" color="primary" />
        )}
      </IconButton>
    </Tooltip>
  );
};

export const useWhatsAppMsg = () => {
  const whatsAppMsgRef = useRef(null);
  const handleSendWhatsAppMsg = () => {
    whatsAppMsgRef.current.click();
  };

  return { whatsAppMsgRef, handleSendWhatsAppMsg };
};

export const WhatsAppMsg = ({
  phoneNumber = process.env.REACT_APP_WHATSAPP_NUMBER,
  message,
  whatsAppMsgRef,
}) => {
  return (
    <>
      <a
        ref={whatsAppMsgRef}
        href={`https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(
          message
        )}`}
        style={{ display: "none" }} // Hide the link
      ></a>
    </>
  );
};

export const useShowHide = () => {
  const [show, setShow] = useState(false);

  const handleShowHide = () => {
    setShow((prev) => !prev);
  };

  return { show, handleShowHide };
};

export const firstDateOfMonth = () => {
  return moment().startOf("month").format("YYYY-MM-DD");
};
export const firstDatePrevMonthByDate = (date) => {
  return moment(date)
    .subtract(1, "months")
    .startOf("month")
    .format("YYYY-MM-DD");
};
export const lastDatePrevMonthByDate = (date) => {
  return moment(date).subtract(1, "months").endOf("month").format("YYYY-MM-DD");
};

export const ColoredSpan = ({ color = primary, children }) => {
  return (
    <Box component={"span"} color={color}>
      {children}
    </Box>
  );
};

export const getBooleanFromObject = (data = {}) => {
  const hasValue = Object.values(data).length > 0;
  return hasValue;
};

export const amountFormat = (amount) => {
  if (amount) {
    amount = eval(amount);
    return String(amount).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  } else {
    return "0";
  }
};

export const useNavigationWithState = () => {
  const navigate = useNavigate();
  const setNavigateState = (url, state) => {
    navigate(url, {
      state: state,
    });
  };
  return { setNavigateState };
};

export const useGetWindowHeight = () => {
  const [height, setHeight] = useState(window.innerHeight);
  useLayoutEffect(() => {
    const handleResize = () => {
      setHeight(window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return { height };
};

export const useCheckScreenBelowBreakPoint = (breakPoint = "md") => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down(breakPoint));
  return matches;
};

export const showObjErrors = (errors, showErrorSnackbar) => {
  for (const key in errors) {
    if (errors.hasOwnProperty(key)) {
      const errorMessage = errors[key];
      showErrorSnackbar(`${errorMessage}`);
    }
  }
};

export const groupImgesUrls = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRy9WAvl7HSb6g-mj26NrnpBXIz5Jga_xQHoQ&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGW51GXOLVvG3PYfEX2rhgU_QRbIfmYydfrg&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeipi9pIBU1VwmyefkyipzrHsyzqEUfcOhrQ&s",
];
