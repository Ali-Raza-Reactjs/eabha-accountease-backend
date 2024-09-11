import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
  Box,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  GetGroupMembersExpenses,
  GetMembersExpenseSummary,
  GetReceivedHistory,
  loadMemberExpensesHistory,
} from "../../apis/Axios";
import EyeButton from "../../components/Buttons/EyeButton";
import PageHeader from "../../components/PageHeader/PageHeader";
import {
  BackArrowButton,
  GridContainer,
  GridItem,
  HistoryButton,
  LoadMoreButton,
  Member,
  NavigateSnackbar,
  PageHeaderButton,
  PageMainBox,
  PopperComponent,
  RecievedMoneyButton,
  SnackBarComponent,
  SummaryIconButton,
  TableRowsLoader,
  TimeLineComponent,
  TimeLineItemComponent,
  amountFormat,
  centerColumns,
  currentDate,
  dateFormat,
  fetchMethod,
  firstDateOfMonth,
  firstDatePrevMonthByDate,
  getDay,
  green,
  lastDatePrevMonthByDate,
  primary,
  red,
  roundOff,
  secondary,
  useMenuForLoop,
  useSnackbar,
} from "../../utils/Helper";
import AddUpdateExpenseModal from "./Modals/AddUpdateExpense.js";
import ReceivedAmountModal from "./Modals/ReceivedAmount";
import VeiwExpensesModal from "./Modals/VeiwExpenses";

import { useNavigate, useParams } from "react-router-dom";
import DataGridComp from "../../components/DataTables/DataGrid";
import ReceivedDetailsModal from "./Modals/ReceivedDetails";
import { routesUrls } from "../../routes/urls.js";
function Row(props) {
  const { row, memberId } = props;
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadButton, setLoadButton] = useState({
    show: {},
    loading: {},
  });
  const [summary, setSummary] = useState({
    show: false,
    data: {},
    loading: false,
  });
  const [selectedDate, setSelectedDate] = useState({
    createdFrom: firstDateOfMonth(),
    createdTo: currentDate(),
  });
  const [receivedDetails, setReceivedDetails] = useState({
    open: false,
    loading: true,
    data: [],
  });

  const {
    anchorEl: anchorElPopper,
    openElem: openElemPopper,
    handleOpen: handleOpenPopper,
    handleClose: handleClosePopper,
  } = useMenuForLoop();

  const handleLoadMoreHistory = async (memberId, createdTo, createdFrom) => {
    setLoadButton((prev) => ({
      ...prev,
      loading: { ...prev.loading, [memberId]: true },
    }));
    const { response } = await fetchMethod(() =>
      loadMemberExpensesHistory(memberId, createdTo, createdFrom)
    );
    const _data = response.data.adjustmentDetails;
    setLoadButton((prev) => ({
      ...prev,
      loading: { ...prev.loading, [memberId]: false },
    }));
    setHistory((prev) => [...prev, ..._data]);
    if (_data.length === 0) {
      setLoadButton((prev) => ({
        ...prev,
        show: { ...prev.show, [memberId]: false },
      }));
    }
  };

  const handleGetSummary = async () => {
    setSummary((prev) => ({ ...prev, show: !prev.show }));
    if (!summary.show) {
      const { response } = await fetchMethod(
        () => GetMembersExpenseSummary(null, null, memberId),
        setSummary
      );
      if (response.status) {
        const _data = response.data;
        setSummary((prev) => ({ ...prev, data: _data }));
      }
    }
  };

  const handleGetReceivedHistory = async (id) => {
    setReceivedDetails((prev) => ({ ...prev, open: true }));
    const { response } = await fetchMethod(
      () => GetReceivedHistory(null, null, id),
      setReceivedDetails
    );
    if (response.status) {
      setReceivedDetails((prev) => ({
        ...prev,
        data: response.data,
      }));
    }
  };
  const columns = [
    {
      field: "Expenses",
      headerName: "Expenses",
      minWidth: 100,
      flex: 1,
      ...centerColumns,
      renderCell: ({ row }) => {
        return (
          <>
            <Typography variant="h6">{row.expenses}</Typography>
          </>
        );
      },
    },
    {
      field: "Paid",
      headerName: "Paid",
      minWidth: 60,
      flex: 1,
      ...centerColumns,
      renderCell: ({ row }) => {
        return (
          <>
            <Typography variant="h6" color={green}>
              {amountFormat(row.paidAmount)}
            </Typography>
          </>
        );
      },
    },
    {
      field: "Splited",
      headerName: "Splited",
      minWidth: 80,
      flex: 1,
      ...centerColumns,
      renderCell: ({ row }) => {
        return (
          <>
            <Typography variant="h6" color={red}>
              {amountFormat(row.splitAmount)}
            </Typography>
          </>
        );
      },
    },
    {
      field: "Given",
      headerName: "Given",
      minWidth: 80,
      flex: 1,
      ...centerColumns,
      renderCell: ({ row }) => {
        return (
          <>
            <Typography variant="h6" color={green}>
              {amountFormat(row.givenAmount)}
            </Typography>
          </>
        );
      },
    },
    {
      field: "Received",
      headerName: "Received",
      minWidth: 100,
      flex: 1,
      ...centerColumns,
      renderCell: ({ row }) => {
        return (
          <>
            <Typography variant="h6" color={red}>
              {amountFormat(row.receivedAmount)}
            </Typography>
          </>
        );
      },
    },
    {
      field: "Net",
      headerName: "Net",
      minWidth: 80,
      flex: 1,
      ...centerColumns,
      renderCell: ({ row }) => {
        return (
          <>
            <Typography variant="h6" color={row.net > 0 ? green : red}>
              {amountFormat(row.net)}
            </Typography>
          </>
        );
      },
    },
    {
      field: "Action",
      headerName: "Action",
      minWidth: 80,
      flex: 1,
      ...centerColumns,
      renderCell: ({ row }) => {
        return (
          <>
            {(row.receivedAmount > 0 || row.givenAmount) && (
              <EyeButton onClick={() => handleGetReceivedHistory(row._id)} />
            )}
          </>
        );
      },
    },
  ];

  useEffect(() => {
    setHistory(row.balanceAdjustmentDetails);
    setLoadButton((prev) => ({
      ...prev,
      show: { ...prev.show, [memberId]: true },
    }));
  }, [row]);

  const getAdjustmentAction = (type) => (type === "+" ? "paid" : "splitted");

  const getGeneralAction = (type) =>
    type === "+" ? "given to" : "received from";

  const formatAdjustmentMessage = (value) => {
    const action = value.expenseId
      ? getAdjustmentAction(value.type)
      : getGeneralAction(value.type);
    return `${value.adjustmentAmount} ${action} ${
      value.expenseId ? "in expense" : "group member"
    }  .${value.prevBalance} changed to ${value.newBalance}`;
  };
  return (
    <>
      <TableRow>
        <TableCell sx={{ p: "16px 8px" }}>
          <Member src={row.profile} name={row.name} email={row.email} />
        </TableCell>
        <TableCell
          align="center"
          sx={{
            p: 1,
            fontWeight: 600,
            color:
              row.expenseBalance === 0
                ? primary
                : row.expenseBalance > 0
                ? green
                : red,
          }}
        >
          {roundOff(row.expenseBalance)}
        </TableCell>
        <TableCell align="right" sx={{ p: "16px 8px" }}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ padding: 0 }} colSpan={6}>
          <Collapse
            in={open}
            timeout="auto"
            unmountOnExit
            sx={{ maxHeight: "200px !important", overflow: "scroll", p: 0 }}
          >
            {/* <Box sx={{ textAlign: "right", pr: 1 }}>
              <SummaryIconButton onClick={handleGetSummary} />
              {summary.show && (
                <DataGridComp
                  columns={columns}
                  getRowId={(row) => row._id}
                  rows={summary.data}
                  loading={summary.loading}
                  disableColumnFilter
                  disableColumnMenu
                  disableColumnSorting
                />
              )}
            </Box> */}
            <Box>
              <TimeLineComponent>
                {history.map((value, index) => {
                  const color = value.type === "+" ? green : red;
                  const isExpesne = value.expenseId;
                  return (
                    <TimeLineItemComponent
                      key={index}
                      index={index}
                      data={history}
                      TimelineOppositeContentData={
                        <>
                          <Typography variant="h6" fontWeight={400}>
                            {dateFormat(value.createdAt)}
                          </Typography>
                        </>
                      }
                      TimelineContentData={
                        <>
                          <Box sx={{ position: "relative" }}>
                            <Typography
                              variant="h6"
                              color={color}
                              sx={{ width: "calc(100% - 36px)" }}
                            >
                              {formatAdjustmentMessage(value)}
                            </Typography>

                            {value.type && (
                              <PopperComponent
                                sx={{ position: "absolute", top: -9, right: 0 }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                  }}
                                >
                                  {isExpesne ? (
                                    <>
                                      <Box sx={{ display: "flex", gap: 0.5 }}>
                                        <Typography
                                          variant="h6"
                                          color={secondary}
                                        >
                                          {"Expense Date: "}
                                        </Typography>
                                        <Typography
                                          variant="h6"
                                          color={primary}
                                        >
                                          {dateFormat(value.expenseDate)} (
                                          {getDay(value.expenseDate)})
                                        </Typography>
                                      </Box>
                                      <Box sx={{ display: "flex", gap: 0.5 }}>
                                        <Typography
                                          variant="h6"
                                          color={secondary}
                                        >
                                          {"Expense Description: "}
                                        </Typography>
                                        <Typography
                                          variant="h6"
                                          color={primary}
                                        >
                                          {value.expenseDescription}
                                        </Typography>
                                      </Box>
                                    </>
                                  ) : (
                                    <>
                                      <Box sx={{ display: "flex", gap: 0.5 }}>
                                        <Typography
                                          variant="h6"
                                          color={secondary}
                                        >
                                          {value.type === "+"
                                            ? "Given date"
                                            : "Received Date: "}
                                        </Typography>
                                        <Typography
                                          variant="h6"
                                          color={primary}
                                        >
                                          {dateFormat(value.receivedAmountDate)}{" "}
                                          ({getDay(value.receivedAmountDate)})
                                        </Typography>
                                      </Box>
                                      <Box sx={{ display: "flex", gap: 0.5 }}>
                                        <Typography
                                          variant="h6"
                                          color={secondary}
                                        >
                                          {value.type === "+"
                                            ? "To Member: "
                                            : "From Member: "}
                                        </Typography>
                                        <Typography
                                          variant="h6"
                                          color={primary}
                                        >
                                          {value.type === "+"
                                            ? value.toMemberName
                                            : value.fromMemberName}
                                        </Typography>
                                      </Box>
                                      <Box sx={{ display: "flex", gap: 0.5 }}>
                                        <Typography
                                          variant="h6"
                                          color={secondary}
                                        >
                                          {"Comment: "}
                                        </Typography>
                                        <Typography
                                          variant="h6"
                                          color={primary}
                                        >
                                          {value.receivedAmontComment}
                                        </Typography>
                                      </Box>
                                    </>
                                  )}
                                </Box>
                              </PopperComponent>
                            )}
                          </Box>
                        </>
                      }
                    />
                  );
                })}
              </TimeLineComponent>
            </Box>
            {loadButton.show[memberId] && (
              <Box className={"flex_center"}>
                <LoadMoreButton
                  loading={loadButton.loading[memberId]}
                  onClick={() => {
                    const _createdFrom = firstDatePrevMonthByDate(
                      selectedDate.createdFrom
                    );
                    const _createdTo = lastDatePrevMonthByDate(
                      selectedDate.createdTo
                    );
                    setSelectedDate({
                      createdFrom: _createdFrom,
                      createdTo: _createdTo,
                    });
                    handleLoadMoreHistory(memberId, _createdFrom, _createdTo);
                  }}
                />
              </Box>
            )}
          </Collapse>
        </TableCell>
      </TableRow>
      {receivedDetails.open && (
        <ReceivedDetailsModal
          open={receivedDetails.open}
          data={receivedDetails}
          onClose={() =>
            setReceivedDetails((prev) => ({ ...prev, open: false }))
          }
        />
      )}
    </>
  );
}
export default function ExpensesByGroupId() {
  const { groupDetails } = useParams();
  const navigate = useNavigate();
  const [groupName, groupId] = groupDetails.split("_");

  const [groupMembers, setGroupMembers] = useState([]);
  const [groupMembersExpenses, setGroupMembersExpenses] = useState({
    loading: true,
    data: [],
  });
  const initialAddExpenseFields = {
    open: false,
  };
  const [addExpense, setAddExpense] = useState(initialAddExpenseFields);
  const initialViewExpensesFields = {
    open: false,
  };
  const [viewExpenses, setViewExpenses] = useState(initialViewExpensesFields);
  const initialReceivedAmountFields = {
    open: false,
  };
  const [receivedAmount, setReceivedAmount] = useState(
    initialReceivedAmountFields
  );
  const { snackbar } = useSnackbar();

  const handleGetExpenses = async () => {
    const { response } = await fetchMethod(
      () => GetGroupMembersExpenses(groupId),
      setGroupMembersExpenses
    );
    if (response.status) {
      setGroupMembersExpenses((prev) => ({ ...prev, data: response.data }));
      const groupMembers = response.data?.map((dt) => {
        return {
          name: dt.name,
          email: dt.email,
          profile: dt.profile,
          _id: dt.memberId,
        };
      });
      setGroupMembers(groupMembers);
    }
  };

  useEffect(() => {
    handleGetExpenses();
  }, []);
  return (
    <>
      <PageHeader title={groupName}>
        <PageHeaderButton
          title={"+ Add Expense"}
          onClick={() => setAddExpense((prev) => ({ ...prev, open: true }))}
        />
      </PageHeader>
      <PageMainBox>
        <GridContainer>
          <GridItem md={12}>
            <Box className={"flex_between"}>
              <Box className={"flex_between"} gap={1}>
                <BackArrowButton
                  onClick={() => navigate(routesUrls.EXPENSES)}
                />
                <RecievedMoneyButton
                  title={"Received Amount"}
                  onClick={() => {
                    setReceivedAmount((prev) => ({ ...prev, open: true }));
                  }}
                />
              </Box>
              <HistoryButton
                loading={false}
                onClick={() => {
                  setViewExpenses((prev) => ({ ...prev, open: true }));
                }}
              />
            </Box>
          </GridItem>
          <GridItem md={12}>
            <TableContainer
              component={Paper}
              sx={{
                "&td": {
                  padding: 0,
                },
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ p: "16px 8px" }}>
                      <Typography
                        variant="h6"
                        fontWeight={600}
                        color={secondary}
                        minWidth={130}
                      >
                        Member
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ p: "16px 8px" }}>
                      <Typography
                        variant="h6"
                        fontWeight={600}
                        color={secondary}
                        minWidth={100}
                      >
                        Expense Amount
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ p: "16px 8px" }}>
                      <Typography
                        variant="h6"
                        fontWeight={600}
                        color={secondary}
                      >
                        History
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groupMembersExpenses.loading ? (
                    <TableRowsLoader columnsNum={3} />
                  ) : (
                    groupMembersExpenses.data.map((row) => (
                      <Row
                        key={row.memberId}
                        row={row}
                        memberId={row.memberId}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </GridItem>
        </GridContainer>
      </PageMainBox>

      {/* Add Expense modal */}
      {addExpense.open && (
        <AddUpdateExpenseModal
          groupId={groupId}
          groupDetails={groupDetails}
          groupMembers={groupMembers}
          title={"Add Expense"}
          open={addExpense.open}
          onClose={() => setAddExpense(initialAddExpenseFields)}
          handleGetExpenses={handleGetExpenses}
        />
      )}
      {viewExpenses.open && (
        <VeiwExpensesModal
          open={viewExpenses.open}
          onClose={() => setViewExpenses(initialViewExpensesFields)}
          groupId={groupId}
          groupMembers={groupMembers}
          handleGetGroupMembersExpenses={handleGetExpenses}
        />
      )}
      {receivedAmount.open && (
        <ReceivedAmountModal
          title={"Received Amount"}
          open={receivedAmount.open}
          onClose={() => setReceivedAmount(initialViewExpensesFields)}
          handleGetExpenses={handleGetExpenses}
          groupMembers={groupMembers}
          groupId={groupId}
        />
      )}

      <SnackBarComponent data={snackbar} />
      <NavigateSnackbar />
    </>
  );
}
