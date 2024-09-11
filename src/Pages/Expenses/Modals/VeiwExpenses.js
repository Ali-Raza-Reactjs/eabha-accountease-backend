import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { memo, useEffect, useState } from "react";
import {
  DeleteExpense,
  GetExpenses,
  GetMembersExpenseSummary,
} from "../../../apis/Axios";
import MyButton from "../../../components/Buttons/MyButton";
import DataGridComp from "../../../components/DataTables/DataGrid";
import ModalComponent from "../../../components/Modals/ModalComponent";
import MyTextField from "../../../components/TextField/MyTextField";
import MyTextFieldLabel from "../../../components/TextField/MyTextFieldLabel";
import {
  CheckboxComponent,
  CicrlesLoading,
  DeleteModal,
  DialogContentComp,
  Enums,
  GridContainer,
  GridItem,
  LoadingTextField,
  Member,
  PopperComponent,
  SnackBarComponent,
  ToggleEyeButton,
  amountFormat,
  centerColumns,
  clearFilterOption,
  currentDate,
  dateFormat,
  dateTimeFormatUtc,
  fetchMethod,
  firstDateOfMonth,
  getOptions,
  green,
  primary,
  red,
  secondary,
  textTrucate,
  useDelete,
  useGetAllMembers,
  useGetAllMembersForAddGroup,
  useSnackbar,
} from "../../../utils/Helper";
import DeleteButton from "../../../components/Buttons/DeleteButton";
import EditButton from "../../../components/Buttons/EditButton";
import AddUpdateExpenseModal from "./AddUpdateExpense";

const ExpenseCard = memo(
  ({ data, index, handleUpdateExpense, handleDeleteExpense }) => {
    const paidMembersDetails = data?.paidMemberDetailsArray;
    const splitMembersDetails = data?.splitMemberDetailsArray;

    const rows = [...paidMembersDetails, ...splitMembersDetails].reduce(
      (acc, member) => {
        const existingMember = acc.find(
          (item) => item.memberId === member.memberId
        );

        if (existingMember) {
          existingMember.amountPaid =
            (existingMember.amountPaid || 0) + (member.amountPaid || 0);
          existingMember.amountSplitted =
            (existingMember.amountSplitted || 0) + (member.amountSplitted || 0);
        } else {
          acc.push({
            memberId: member.memberId,
            name: member.name,
            email: member.email,
            profile: member.profile,
            amountPaid: member.amountPaid || 0,
            amountSplitted: member.amountSplitted || 0,
          });
        }

        return acc;
      },
      []
    );

    return (
      <Box
        component={Paper}
        elevation={3}
        sx={{
          overflow: "hidden",
        }}
      >
        <Box
          className={index === 0 ? "flex_between" : "flex_center"}
          sx={{ bgcolor: primary, p: { xs: 1, md: 1.5 } }}
        >
          {index === 0 && (
            <EditButton
              color={"secondary"}
              onClick={() => handleUpdateExpense(data)}
            />
          )}
          <Typography variant="h3" color={"#fff"} fontWeight={400}>
            {textTrucate(data?.description)}
          </Typography>
          {index === 0 && <DeleteButton onClick={handleDeleteExpense} />}
        </Box>
        <Box sx={{ p: { xs: 1, md: 1.5 } }}>
          <Box className={"flex_center"} height={10}>
            <MyTextFieldLabel
              title={dateFormat(data.expenseDate)}
              required={false}
            />
            <PopperComponent>
              <Typography variant="h6" color={secondary}>
                Added by {data.createdBy} On {dateTimeFormatUtc(data.createdAt)}
              </Typography>
            </PopperComponent>
          </Box>
          <TableContainer>
            <Table size="small" aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ pl: 0 }}>
                    <Typography variant="h6" color={secondary}>
                      Member ({rows.length})
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" color={secondary}>
                      Paid
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ pr: 0 }}>
                    <Typography variant="h6" color={secondary}>
                      Splitted
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow
                    key={row.name}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" sx={{ pl: 0 }}>
                      <Typography variant="h6" color={primary} key={index}>
                        {row.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6" color={green} key={index}>
                        {row.amountPaid}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ pr: 0 }}>
                      <Typography variant="h6" color={red} key={index}>
                        {row.amountSplitted}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ border: "none" }}>
                  <TableCell
                    colSpan={1.5}
                    align="right"
                    sx={{ borderBottom: "none" }}
                  >
                    <Typography variant="h6" key={index}>
                      Total
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ borderBottom: "none" }}>
                    <Typography variant="h6" key={index}>
                      {data.expenseAmount}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ borderBottom: "none", pr: 0 }}>
                    <Typography variant="h6" key={index}>
                      {data.expenseAmount}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    );
  }
);
export default function VeiwExpensesModal(props) {
  const {
    open,
    onClose,
    groupId,
    groupMembers,
    handleGetGroupMembersExpenses = () => {},
  } = props;
  const { loading, members } = useGetAllMembers();
  const { snackbar, setSnackbar } = useSnackbar();

  const [expenses, setExpenses] = useState([]);
  const [membersexpenseSummary, setMembersExpenseSummary] = useState([]);
  const { loading: membersForAddLoading, membersForAddGroup } =
    useGetAllMembersForAddGroup();
  const [filterModel, setFilterModel] = useState({
    showSummary: false,
    loading: true,
    createdFrom: firstDateOfMonth(),
    createdTo: currentDate(),
    selectedMember: null,
  });
  const [updateExpense, setUpdateExpense] = useState({
    open: false,
    data: {},
  });
  const [selectedRow, setSelectedRow] = useState({});

  const handleGetExpenses = async () => {
    const { response } = await fetchMethod(
      () =>
        GetExpenses(
          groupId,
          filterModel.createdFrom,
          filterModel.createdTo,
          filterModel.selectedMember
        ),
      setFilterModel
    );
    if (response.status) {
      setExpenses(response.data);
    }
  };
  const handleGetMembersExpenseSummary = async () => {
    const { response } = await fetchMethod(
      () =>
        GetMembersExpenseSummary(
          filterModel.createdFrom,
          filterModel.createdTo,
          filterModel.selectedMember
        ),
      setFilterModel
    );
    if (response.status) {
      setMembersExpenseSummary(response.data);
    }
  };
  const calculateExpense = (data) => {
    let expenseAmount = 0;
    data.forEach((dt) => {
      expenseAmount += dt.expenseAmount;
    });
    return { expenseAmount: expenseAmount };
  };

  const handleChangeFilterModel = (e) => {
    setFilterModel((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdateExpense = (row) => {
    setUpdateExpense((prev) => ({ ...prev, open: true, data: row }));
  };

  useEffect(() => {
    handleGetExpenses();
    // handleGetMembersExpenseSummary();
  }, []);
  const { deleteData, setDeleteData, handleDeleteClose, handleDelete } =
    useDelete(DeleteExpense, setSnackbar, () => {
      setExpenses((prev) => prev.filter((dt) => dt._id !== selectedRow._id));
      handleGetExpenses();
      handleGetGroupMembersExpenses();
    });
  const columns = [
    {
      field: "Member",
      headerName: "Member",
      minWidth: 170,
      flex: 1,
      renderCell: ({ row }) => {
        return (
          <>
            <Member src={row.profile} name={row.name} />
          </>
        );
      },
    },
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
  ];

  return (
    <>
      <ModalComponent
        title={
          <>
            Expense Details (
            {amountFormat(calculateExpense(expenses).expenseAmount)})
            {/* <ToggleEyeButton
              show={filterModel.showSummary}
              onClick={() => {
                setFilterModel((prev) => ({
                  ...prev,
                  showSummary: !prev.showSummary,
                }));
              }}
            /> */}
          </>
        }
        open={open}
        onClose={onClose}
        fullScreen={true}
      >
        <GridContainer
          sx={{
            position: "sticky",
            top: -8,
            p: 1,
            bgcolor: "white",
            boxShadow: "0 4px 2px -2px #80808038",
          }}
        >
          <GridItem xs={6} md={3} style={{ paddingTop: 0 }}>
            <MyTextFieldLabel title={"Expense From"} required={false} />
            <MyTextField
              type={"date"}
              value={filterModel.createdFrom}
              onChange={handleChangeFilterModel}
              name={"createdFrom"}
            />
          </GridItem>
          <GridItem xs={6} md={3} style={{ paddingTop: 0 }}>
            <MyTextFieldLabel title={"Expense To"} required={false} />
            <MyTextField
              type={"date"}
              value={filterModel.createdTo}
              onChange={handleChangeFilterModel}
              name={"createdTo"}
            />
          </GridItem>
          <GridItem xs={10} md={3} style={{ paddingTop: 0 }}>
            <MyTextFieldLabel title={"Member"} required={false} />
            {membersForAddLoading ? (
              <LoadingTextField />
            ) : (
              <MyTextField
                select
                value={filterModel.selectedMember}
                onChange={handleChangeFilterModel}
                name={"selectedMember"}
              >
                {clearFilterOption()}
                {getOptions(membersForAddGroup).groupMembers}
              </MyTextField>
            )}
          </GridItem>
          <GridItem xs={2} alignSelf={"end"} md={3}>
            <MyButton
              onClick={() => {
                handleGetExpenses();
                // handleGetMembersExpenseSummary();
              }}
              title={"Filter"}
              p={"0px !important"}
              minWidth={"100%"}
              background={secondary}
            />
          </GridItem>
          {filterModel.showSummary && (
            <GridItem md={12}>
              <DataGridComp
                columns={columns}
                getRowId={(row) => row._id}
                rows={membersexpenseSummary}
                loading={filterModel.loading}
                disableColumnFilter
                disableColumnMenu
                disableColumnSorting
                color={primary}
              />
            </GridItem>
          )}
        </GridContainer>
        <DialogContentComp>
          {filterModel.loading ? (
            <CicrlesLoading height={"100%"} />
          ) : (
            <Box className={"flex_col"} gap={1}>
              {expenses.map((dt, index) => (
                <ExpenseCard
                  data={dt}
                  index={index}
                  key={index}
                  handleUpdateExpense={handleUpdateExpense}
                  handleDeleteExpense={() => {
                    setDeleteData((prev) => ({
                      ...prev,
                      open: true,
                      id: `${groupId}/${dt._id}`,
                    }));
                    setSelectedRow(dt);
                  }}
                />
              ))}
            </Box>
          )}
        </DialogContentComp>
      </ModalComponent>
      {updateExpense.data && (
        <AddUpdateExpenseModal
          data={updateExpense.data}
          groupId={groupId}
          groupMembers={groupMembers}
          title={"Update Expense"}
          open={updateExpense.open}
          onClose={() => setUpdateExpense((prev) => ({ ...prev, open: false }))}
          handleGetExpenses={() => {
            handleGetGroupMembersExpenses();
            handleGetExpenses();
          }}
        />
      )}
      <SnackBarComponent data={snackbar} />
      <DeleteModal
        deleteDetails={
          <>
            expense of
            <br />
            Date : <b>{dateFormat(selectedRow.expenseDate)} </b>
            <br />
            Description : <b>{selectedRow.description}</b>
            <br />
            Amount : <b>{selectedRow.expenseAmount} </b>
          </>
        }
        data={deleteData}
        onClose={handleDeleteClose}
        handleDelete={handleDelete}
      />
    </>
  );
}
