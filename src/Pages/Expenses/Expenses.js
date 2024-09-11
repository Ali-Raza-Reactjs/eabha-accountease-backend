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
  GetMemberExpenses,
  GetMembersExpenseSummary,
  GetReceivedHistory,
  loadMemberExpensesHistory,
} from "../../apis/Axios";
import EyeButton from "../../components/Buttons/EyeButton";
import PageHeader from "../../components/PageHeader/PageHeader";
import {
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
import AddExpenseModal from "./Modals/AddExpense";
import ReceivedAmountModal from "./Modals/ReceivedAmount";
import VeiwExpensesModal from "./Modals/VeiwExpenses";

import DataGridComp from "../../components/DataTables/DataGrid";
import ReceivedDetailsModal from "./Modals/ReceivedDetails";
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
    console.log(row);
    setHistory(row.balanceAdjustmentDetails);
    setLoadButton((prev) => ({
      ...prev,
      show: { ...prev.show, [memberId]: true },
    }));
  }, [row]);

  return (
    <>
      <TableRow>
        <TableCell sx={{ p: "16px 8px" }}>
          <Member src={row.profile} name={row.name} variant="rounded" />
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
            sx={{ maxHeight: "200px !important", overflow: "scroll" }}
          >
            <Box sx={{ textAlign: "right", pr: 1 }}>
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
            </Box>
            {console.log(history)}
            {/* <Box>
              <TimeLineComponent>
                {history.map((value, index) => {
                  const color =
                    value.fromMemberId === memberId
                      ? green
                      : value.toMemberId === memberId
                      ? red
                      : value.type === "+"
                      ? green
                      : red;
                  return (
                    <TimeLineItemComponent
                      key={index}
                      index={index}
                      data={history}
                      TimelineOppositeContentData={
                        <>
                          <Typography variant="h6" fontWeight={400}>
                            {dateFormat(value.createdOn)}
                          </Typography>
                        </>
                      }
                      TimelineContentData={
                        <>
                          <Box sx={{ position: "relative" }}>
                            <Typography variant="h6" color={color}>
                              {value.history}
                            </Typography>

                            {value.type && (
                              <PopperComponent
                                sx={{ position: "absolute", top: -9, right: 0 }}
                              >
                                <Box
                                  className={"flex_center"}
                                  sx={{ flexDirection: "column" }}
                                >
                                  <Typography variant="h6" color={primary}>
                                    {dateFormat(value.date)} (
                                    {getDay(value.date)})
                                  </Typography>{" "}
                                  <Typography variant="h6" color={color}>
                                    {value.description}
                                  </Typography>{" "}
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
            </Box> */}
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
export default function Expenses() {
  const [membersExpenses, setMemberExpenses] = useState({
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
      GetMemberExpenses,
      setMemberExpenses
    );
    if (response.status) {
      setMemberExpenses((prev) => ({ ...prev, data: response.data }));
    }
  };

  useEffect(() => {
    handleGetExpenses();
  }, []);

  return (
    <>
      <PageHeader title={"Expenses"}>
        <PageHeaderButton
          title={"+ Add Expense"}
          onClick={() => setAddExpense((prev) => ({ ...prev, open: true }))}
        />
      </PageHeader>
      <PageMainBox>
        <GridContainer>
          <GridItem md={12}>
            <Box className={"flex_between"}>
              <RecievedMoneyButton
                title={"Received Amount"}
                onClick={() => {
                  setReceivedAmount((prev) => ({ ...prev, open: true }));
                }}
              />
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
                        Action
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {membersExpenses.loading ? (
                    <TableRowsLoader columnsNum={3} />
                  ) : (
                    membersExpenses.data.map((row) => (
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
        <AddExpenseModal
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
        />
      )}
      {receivedAmount.open && (
        <ReceivedAmountModal
          title={"Received Amount"}
          open={receivedAmount.open}
          onClose={() => setReceivedAmount(initialViewExpensesFields)}
          handleGetExpenses={handleGetExpenses}
        />
      )}

      <SnackBarComponent data={snackbar} />
      <NavigateSnackbar />
    </>
  );
}
