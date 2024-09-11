import { Box, Typography } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import {
  DeleteTransaction,
  GetMemberTransactionDetails,
} from "../../apis/Axios";
import Badge from "../../components/Badge/Badge";
import DeleteButton from "../../components/Buttons/DeleteButton";
import EditButton from "../../components/Buttons/EditButton";
import MyButton from "../../components/Buttons/MyButton";
import AccountsCard from "../../components/Cards/AcountsCard";
import DataGridComp from "../../components/DataTables/DataGrid";
import PageHeader from "../../components/PageHeader/PageHeader";
import MySelect from "../../components/TextField/MySelect";
import MyTextField from "../../components/TextField/MyTextField";
import MyTextFieldLabel from "../../components/TextField/MyTextFieldLabel";
import {
  ColoredSpan,
  DeleteModal,
  Enums,
  GridContainer,
  GridItem,
  InfoButton,
  LoadingTextField,
  MyPopper,
  NavigateSnackbar,
  PageHeaderButton,
  PageMainBox,
  SnackBarComponent,
  amountFormat,
  centerColumns,
  clearFilterOption,
  currentDate,
  dateFormat,
  fetchMethod,
  firstDateOfMonth,
  getOptions,
  green,
  primary,
  purple,
  red,
  secondary,
  useCheckScreenBelowBreakPoint,
  useDelete,
  useGetTransactionCategories,
  useGetTransactionTypes,
  useMenuForLoop,
  useSnackbar,
  yellow,
} from "../../utils/Helper";
import AddUpdateTransactionModal from "./Modals/AddUpdateTransaction";

export default function Dashboard() {
  const [filterModel, setFilterModel] = useState({
    createdFrom: firstDateOfMonth(),
    createdTo: currentDate(),
    selectedType: null,
    selectedCategories: [],
  });
  const [accounts, setAccounts] = useState({
    loading: true,
    data: [],
    loan_receivable_amount: {},
  });
  const initialAddTransactionFields = {
    open: false,
    title: "",
  };
  const [addTransaction, setAddUpdateTransaction] = useState(
    initialAddTransactionFields
  );
  const { snackbar, setSnackbar } = useSnackbar();
  const { loading: typesLoading, transactionTypes } = useGetTransactionTypes();
  const { loading: categoriesLoading, transactionCategories } =
    useGetTransactionCategories();
  const below_md = useCheckScreenBelowBreakPoint();
  const handleGetTransactionDetails = async () => {
    const { response } = await fetchMethod(
      filterModel.selectedType === Enums.transactionTypesIds.TAKE_A_LOAN ||
        filterModel.selectedType === Enums.transactionTypesIds.REPAY_A_LOAN ||
        filterModel.selectedType === Enums.transactionTypesIds.RECEIVABLE
        ? () =>
            GetMemberTransactionDetails(
              null,
              null,
              filterModel.selectedType,
              String(filterModel.selectedCategories)
            )
        : () =>
            GetMemberTransactionDetails(
              filterModel.createdFrom,
              filterModel.createdTo,
              filterModel.selectedType,
              String(filterModel.selectedCategories)
            ),
      setAccounts
    );

    if (response.status) {
      setAccounts((prev) => ({
        ...prev,
        data: response.data.membersTransactionDetail,
        loan_receivable_amount:
          response.data.membersReceivableAndLoanAmountDetail,
      }));
    }
  };
  const { deleteData, setDeleteData, handleDeleteClose, handleDelete } =
    useDelete(DeleteTransaction, setSnackbar, () => {
      setAccounts((prev) => ({
        ...prev,
        data: prev.data.filter((dt) => dt._id !== selectedRow._id),
      }));
      handleGetTransactionDetails();
    });
  const [selectedRow, setSelectedRow] = useState({});
  const {
    anchorEl: anchorElPopper,
    openElem: openElemPopper,
    handleOpen: handleOpenPopper,
    handleClose: handleClosePopper,
  } = useMenuForLoop();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "selectedCategories") {
      if (value.includes("")) {
        setFilterModel((prev) => ({ ...prev, [name]: [] }));
        return;
      }
      setFilterModel((prev) => ({ ...prev, [name]: value }));
      return;
    }
    setFilterModel((prev) => ({ ...prev, [name]: value }));
  };

  const transactionSum = useMemo(() => {
    const data = accounts.data.reduce(
      (acc, curr) => {
        if (
          curr.transactionTypeId === Enums.transactionTypesIds.RECEIVED ||
          curr?.additionalTransactionTypeId ===
            Enums.transactionTypesIds.RECEIVED
        ) {
          acc.received += curr.amount;
        }
        if (
          curr.transactionTypeId === Enums.transactionTypesIds.RECEIVABLE ||
          curr?.additionalTransactionTypeId ===
            Enums.transactionTypesIds.RECEIVABLE
        ) {
          acc.pending += curr.amount;
        }
        if (
          curr.transactionTypeId === Enums.transactionTypesIds.SPENT ||
          curr.transactionTypeId === Enums.transactionTypesIds.GIVE_A_LOAN ||
          curr?.additionalTransactionTypeId === Enums.transactionTypesIds.SPENT
        ) {
          acc.spent += curr.amount;
        }

        return acc; // <--- Add this line
      },
      { received: 0, spent: 0 }
    );
    return data; // <--- Add this line
  }, [accounts.data]);

  const columns = [
    {
      field: "Date",
      headerName: "Date",
      minWidth: 110,
      flex: 1,
      ...centerColumns,
      renderCell: ({ row }) => {
        return (
          <>
            <Typography variant="h6" color={primary}>
              {dateFormat(row.date)}
            </Typography>
            <InfoButton
              onClick={(e) => {
                handleOpenPopper(e, row._id);
                setSelectedRow(row);
              }}
            />
          </>
        );
      },
    },
    {
      field: "Amount",
      headerName: "Amount",
      minWidth: 70,
      flex: 1,
      ...centerColumns,
      renderCell: ({ row }) => {
        return (
          <>
            <Typography variant="h6" color={primary}>
              {amountFormat(row.amount)}
            </Typography>
          </>
        );
      },
    },
    {
      field: "Type",
      headerName: "Type",
      minWidth: 70,
      flex: 1,
      ...centerColumns,
      renderCell: ({ row }) => {
        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Badge
              title={row.transactionTypeName}
              color={
                row.transactionTypeId == Enums.transactionTypesIds.RECEIVED
                  ? "green"
                  : row.transactionTypeId == Enums.transactionTypesIds.SPENT ||
                    row.transactionTypeId ==
                      Enums.transactionTypesIds.GIVE_A_LOAN ||
                    row.transactionTypeId ==
                      Enums.transactionTypesIds.REPAY_A_LOAN
                  ? "purple"
                  : row.transactionTypeId ==
                    Enums.transactionTypesIds.TAKE_A_LOAN
                  ? "red"
                  : "yellow"
              }
            />

            <Typography
              color={
                row.additionalTransactionTypeId ==
                Enums.transactionTypesIds.RECEIVED
                  ? green
                  : row.additionalTransactionTypeId ==
                    Enums.transactionTypesIds.SPENT
                  ? purple
                  : row.additionalTransactionTypeId ==
                    Enums.transactionTypesIds.LOAN
                  ? red
                  : yellow
              }
            >
              {row.additionalTransactionTypeName}
            </Typography>

            {row.transactionTypeId == Enums.transactionTypesIds.SPENT && (
              <Typography color={secondary}>
                {row.transactionCategoryName}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      field: "Action",
      headerName: "Action",
      minWidth: 70,
      flex: 1,
      ...centerColumns,
      renderCell: ({ row }) => {
        return (
          <Box className={"flex_between"} gap={{ xs: 0.5, md: 1.5 }}>
            <EditButton
              onClick={() => {
                setAddUpdateTransaction((prev) => ({
                  ...prev,
                  open: true,
                  title: "Update Transaction",
                }));
                setSelectedRow(row);
              }}
            />
            <DeleteButton
              onClick={() => {
                setDeleteData((prev) => ({
                  ...prev,
                  open: true,
                  id: row._id,
                }));
                setSelectedRow(row);
              }}
            />
          </Box>
        );
      },
    },
  ];

  useEffect(() => {
    handleGetTransactionDetails();
  }, []);

  return (
    <>
      <PageHeader title={"Accounts"}>
        <PageHeaderButton
          title={"+ Add Transaction"}
          onClick={() => {
            setAddUpdateTransaction((prev) => ({
              ...prev,
              open: true,
              title: "Add Transaction",
            }));
            setSelectedRow({});
          }}
        />
      </PageHeader>
      <PageMainBox>
        <GridContainer>
          <GridItem xs={6} md={3}>
            <AccountsCard
              loading={accounts.loading}
              cardTitle={"Recieved"}
              amount={amountFormat(transactionSum.received)}
            />
          </GridItem>
          <GridItem xs={6} md={3}>
            <AccountsCard
              loading={accounts.loading}
              cardTitle={"Receivable"}
              amount={amountFormat(
                accounts.loan_receivable_amount?.totalPendingAmount
              )}
            />
          </GridItem>
          <GridItem xs={6} md={3}>
            <AccountsCard
              loading={accounts.loading}
              cardTitle={"Spent"}
              amount={amountFormat(transactionSum.spent)}
            />
          </GridItem>
          <GridItem xs={6} md={3}>
            <AccountsCard
              loading={accounts.loading}
              cardTitle={"Loan"}
              amount={amountFormat(
                accounts.loan_receivable_amount?.totalLoanAmount
              )}
            />
          </GridItem>
          <GridItem xs={6} md={3}>
            <AccountsCard
              loading={accounts.loading}
              cardTitle={"Remaining"}
              amount={amountFormat(
                transactionSum.received - transactionSum.spent
              )}
            />
          </GridItem>
          <GridContainer>
            {filterModel.selectedType !==
              Enums.transactionTypesIds.TAKE_A_LOAN &&
              filterModel.selectedType !==
                Enums.transactionTypesIds.REPAY_A_LOAN &&
              filterModel.selectedType !==
                Enums.transactionTypesIds.RECEIVABLE && (
                <>
                  <GridItem xs={6} md={3}>
                    <MyTextFieldLabel
                      title={"Transaction From"}
                      required={false}
                    />
                    <MyTextField
                      type={"date"}
                      value={filterModel.createdFrom}
                      onChange={handleChange}
                      name={"createdFrom"}
                    />
                  </GridItem>
                  <GridItem xs={6} md={3}>
                    <MyTextFieldLabel
                      title={"Transaction To"}
                      required={false}
                    />
                    <MyTextField
                      type={"date"}
                      value={filterModel.createdTo}
                      onChange={handleChange}
                      name={"createdTo"}
                    />
                  </GridItem>
                </>
              )}
            <GridItem
              xs={
                filterModel.selectedType === Enums.transactionTypesIds.SPENT
                  ? 6
                  : 10
              }
              md={2.5}
              style={{ paddingTop: below_md && 0 }}
            >
              <MyTextFieldLabel title={"Transaction Type"} required={false} />
              {typesLoading ? (
                <LoadingTextField />
              ) : (
                <MyTextField
                  select
                  value={filterModel.selectedType}
                  onChange={(e) => {
                    handleChange(e);
                    setFilterModel((prev) => ({
                      ...prev,
                      selectedCategories: [],
                    }));
                  }}
                  name={"selectedType"}
                >
                  {clearFilterOption()}
                  {getOptions(transactionTypes).transactionTypes}
                </MyTextField>
              )}
            </GridItem>
            {filterModel.selectedType === Enums.transactionTypesIds.SPENT && (
              <GridItem xs={4} md={2.5} style={{ paddingTop: 0 }}>
                <MyTextFieldLabel title={"Category"} required={false} />
                {categoriesLoading ? (
                  <LoadingTextField />
                ) : (
                  <MySelect
                    multiple
                    value={filterModel.selectedCategories}
                    onChange={handleChange}
                    name={"selectedCategories"}
                  >
                    {clearFilterOption()}
                    {getOptions(transactionCategories).transactionCategories}
                  </MySelect>
                )}
              </GridItem>
            )}
            <GridItem
              xs={2}
              alignSelf={"end"}
              md={
                filterModel.selectedType === Enums.transactionTypesIds.SPENT
                  ? 2
                  : 3
              }
              style={{ paddingTop: 0 }}
            >
              <MyButton
                onClick={handleGetTransactionDetails}
                title={"Filter"}
                p={below_md && "0px !important"}
                minWidth={below_md && "100%"}
                background={secondary}
              />
            </GridItem>
          </GridContainer>
          <GridItem md={12}>
            <DataGridComp
              columns={columns}
              getRowId={(row) => row._id}
              rows={accounts.data}
              loading={accounts.loading}
            />
            <MyPopper
              anchorEl={anchorElPopper}
              open={openElemPopper === selectedRow._id}
              handleClose={handleClosePopper}
            >
              <div>
                <Typography variant="h6">
                  <ColoredSpan color={secondary}> Comment:</ColoredSpan>
                  <ColoredSpan> {selectedRow.comment}</ColoredSpan>
                </Typography>
              </div>
            </MyPopper>
          </GridItem>
        </GridContainer>
      </PageMainBox>
      {addTransaction.open && (
        <AddUpdateTransactionModal
          title={addTransaction.title}
          open={addTransaction.open}
          onClose={() =>
            setAddUpdateTransaction((prev) => ({ ...prev, open: false }))
          }
          handleGetTransactionDetails={handleGetTransactionDetails}
          data={selectedRow}
        />
      )}
      <SnackBarComponent data={snackbar} />
      <DeleteModal
        deleteDetails={
          <>
            transaction of
            <br />
            Date : <b>{dateFormat(selectedRow.date)} </b>
            <br />
            Type : <b>{selectedRow.transactionTypeName} </b>
            {selectedRow.transactionTypeId ===
              Enums.transactionTypesIds.SPENT && (
              <>
                <br />
                Category : <b>{selectedRow.transactionCategoryName} </b>
              </>
            )}
            <br />
            Amount : <b>{amountFormat(selectedRow.amount)}</b>
            <br />
            Comment : <b>{selectedRow.comment}</b>
          </>
        }
        data={deleteData}
        onClose={handleDeleteClose}
        handleDelete={handleDelete}
      />
      <NavigateSnackbar />
    </>
  );
}
