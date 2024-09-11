import { Box, DialogActions } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { AddTransaction, UpdateTransaction } from "../../../apis/Axios";
import MyButton from "../../../components/Buttons/MyButton";
import ModalComponent from "../../../components/Modals/ModalComponent";
import MyTextField from "../../../components/TextField/MyTextField";
import MyTextFieldLabel from "../../../components/TextField/MyTextFieldLabel";
import { routesUrls } from "../../../routes/urls";
import {
  currentDate,
  dateFormatForInput,
  DialogContentComp,
  Enums,
  fetchMethod,
  getBooleanFromObject,
  getOptions,
  GridContainer,
  GridItem,
  LoadingTextField,
  secondary,
  SwitchComponent,
  TwoSidedSwitchComponent,
  useForm,
  useGetTransactionCategories,
  useGetTransactionTypes,
  useNavigateSnackbar,
} from "../../../utils/Helper";

export default function AddUpdateTransactionModal(props) {
  const {
    title,
    open,
    onClose,
    handleGetTransactionDetails,
    data = {},
  } = props;
  const { loading: typesLoading, transactionTypes } = useGetTransactionTypes();

  const { loading: categoriesLoading, transactionCategories } =
    useGetTransactionCategories();
  const isEditMode = getBooleanFromObject(data);
  const initialSubmitDataFields = {
    loading: false,
    amount: "",
    date: currentDate(),
    selectedType: Enums.transactionTypesIds.SPENT,
    selectedAdditionalType: null,
    selectedCategory: Enums.transactionCategoriesIds.GENERAL,
    comment: "",
    isReceivable: false,
    payLoan: false,
  };

  const [submitData, setSubmitData] = useState(initialSubmitDataFields);
  const { setSuccessNavigationSnackbar } = useNavigateSnackbar();
  const { errors, handleChange, handleInvalid } = useForm(setSubmitData);

  const handleAddTransaction = async () => {
    const { response } = await fetchMethod(
      () =>
        AddTransaction(
          submitData.date,
          Number(submitData.amount),
          submitData.selectedType,
          submitData.selectedCategory,
          submitData.comment,
          submitData.isReceivable,
          submitData.payLoan
        ),
      setSubmitData
    );
    if (response.status) {
      setSuccessNavigationSnackbar(routesUrls.ACCOUNTS, response.msg);
      handleGetTransactionDetails();
      onClose();
    }
  };
  const handleUpdateTransaction = async () => {
    const { response } = await fetchMethod(
      () =>
        UpdateTransaction(
          data._id,
          submitData.date,
          Number(submitData.amount),
          submitData.selectedType,
          submitData.selectedAdditionalType,
          submitData.selectedCategory,
          submitData.comment
        ),
      setSubmitData
    );
    if (response.status) {
      setSuccessNavigationSnackbar(routesUrls.ACCOUNTS, response.msg);
      handleGetTransactionDetails();
      onClose();
    }
  };

  useEffect(() => {
    if (isEditMode) {
      setSubmitData((prev) => ({
        ...prev,
        amount: data.amount,
        date: dateFormatForInput(data.date),
        selectedType: data.transactionTypeId,
        selectedAdditionalType: data.additionalTransactionTypeId,
        selectedCategory: data.transactionCategoryId,
        comment: data.comment,
        isReceivable: data.isReceivable,
      }));
    }
  }, [data]);

  console.log(transactionTypes);
  return (
    <>
      <ModalComponent
        title={title}
        open={open}
        onClose={onClose}
        maxWidth={"sm"}
      >
        <form
          onInvalid={handleInvalid}
          onSubmit={(e) => {
            e.preventDefault();
            if (isEditMode) {
              handleUpdateTransaction();
            } else {
              handleAddTransaction();
            }
          }}
        >
          <DialogContentComp>
            <GridContainer spacing={2}>
              <GridItem md={12}>
                <MyTextFieldLabel title={"Date"} />
                <MyTextField
                  type={"date"}
                  name={"date"}
                  value={submitData.date}
                  onChange={handleChange}
                  errors={errors}
                />
              </GridItem>

              <GridItem md={12}>
                <MyTextFieldLabel title={"Amount"} />
                <MyTextField
                  type={"number"}
                  name={"amount"}
                  value={submitData.amount}
                  onChange={handleChange}
                  errors={errors}
                />
              </GridItem>
              <GridItem md={12}>
                <Box className={"flex_between"}>
                  <MyTextFieldLabel title={"Type"} />
                  {!isEditMode &&
                    submitData.selectedType ===
                      Enums.transactionTypesIds.RECEIVED && (
                      <SwitchComponent
                        color={secondary}
                        label={"Pay Loan"}
                        checked={submitData.payLoan}
                        onChange={(e) => {
                          setSubmitData((prev) => ({
                            ...prev,
                            payLoan: e.target.checked,
                          }));
                        }}
                      />
                    )}
                  {isEditMode &&
                    submitData.selectedType ===
                      Enums.transactionTypesIds.GIVE_A_LOAN && (
                      <TwoSidedSwitchComponent
                        value={Boolean(
                          submitData.selectedAdditionalType ===
                            Enums.transactionTypesIds.RECEIVED
                        )}
                        checked={Boolean(
                          submitData.selectedAdditionalType ===
                            Enums.transactionTypesIds.RECEIVED
                        )}
                        onChange={(e) => {
                          setSubmitData((prev) => ({
                            ...prev,
                            selectedAdditionalType: e.target.checked
                              ? Enums.transactionTypesIds.RECEIVED
                              : Enums.transactionTypesIds.RECEIVABLE,
                          }));
                        }}
                      />
                    )}
                </Box>
                {typesLoading ? (
                  <LoadingTextField />
                ) : (
                  <MyTextField
                    select
                    name={"selectedType"}
                    value={submitData.selectedType}
                    onChange={handleChange}
                    errors={errors}
                  >
                    {getOptions(transactionTypes).transactionTypes}
                  </MyTextField>
                )}
              </GridItem>
              {submitData.selectedType === Enums.transactionTypesIds.SPENT && (
                <GridItem md={12}>
                  <MyTextFieldLabel title={"Category"} />
                  {categoriesLoading ? (
                    <LoadingTextField />
                  ) : (
                    <MyTextField
                      select
                      name={"selectedCategory"}
                      value={submitData.selectedCategory}
                      onChange={handleChange}
                      errors={errors}
                    >
                      {getOptions(transactionCategories).transactionCategories}
                    </MyTextField>
                  )}
                </GridItem>
              )}
              <GridItem md={12}>
                <MyTextFieldLabel title={"Comment"} />
                <MyTextField
                  name={"comment"}
                  value={submitData.comment}
                  onChange={handleChange}
                  errors={errors}
                />
              </GridItem>
            </GridContainer>
          </DialogContentComp>
          <DialogActions>
            <MyButton
              title={isEditMode ? "Update" : "Save"}
              type={"Submit"}
              loading={submitData.loading}
            />
          </DialogActions>
        </form>
      </ModalComponent>
    </>
  );
}
