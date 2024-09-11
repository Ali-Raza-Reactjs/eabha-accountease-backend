import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  DialogActions,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { AddExpense, UpdateExpense } from "../../../apis/Axios";
import MyButton from "../../../components/Buttons/MyButton";
import ModalComponent from "../../../components/Modals/ModalComponent";
import MyTextField from "../../../components/TextField/MyTextField";
import MyTextFieldLabel from "../../../components/TextField/MyTextFieldLabel";
import { routesUrls } from "../../../routes/urls";
import {
  CheckboxComponent,
  DialogContentComp,
  Enums,
  GridContainer,
  GridItem,
  Member,
  SnackBarComponent,
  currentDate,
  dateFormatForInput,
  fetchMethod,
  getBooleanFromObject,
  getOptions,
  green,
  primary,
  red,
  roundOff,
  showObjErrors,
  useForm,
  useNavigateSnackbar,
  useRefForm,
  useSnackbar,
} from "../../../utils/Helper";

const MemberAccordation = ({ title, expanded, onChange, children }) => {
  return (
    <Accordion
      elevation={0}
      sx={{
        background: "rgba(30, 30, 30, 0.02)",
        borderRadius: { xs: "5px", md: "10px" },
        border: "1px solid rgb(193 193 193)",
        "& .MuiAccordionSummary-content": {
          margin: 0,
        },
        "& .MuiAccordionSummary-content.Mui-expanded": {
          margin: "0px !important",
        },
      }}
      expanded={expanded}
      onChange={onChange}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          px: 1,
          minHeight: { xs: 40, md: 56 },
          "&.Mui-expanded": {
            minHeight: { xs: 40, md: 56 },
          },
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ padding: 0, pr: 1, pb: 1 }}>
        {children}
      </AccordionDetails>
    </Accordion>
  );
};

export default function AddUpdateExpenseModal(props) {
  const {
    title,
    open,
    onClose,
    groupMembers,
    handleGetExpenses,
    groupId,
    groupDetails,
    data,
  } = props;
  const updateMode = getBooleanFromObject(data);
  const initialSubmitDataFields = {
    open: false,
    loading: false,
    selectedDate: currentDate(),
    selectedPaidMembersOpen: false,
    selectedPaidMembers: {},
    selectedSplitMembersOpen: false,
    selectedSplitMembers: {},
    description: "",
    expenseAmount: "",
    selectedSplitType: Enums.splitTypeIds.EQUALLY,
  };
  const [submitData, setSubmitData] = useState(initialSubmitDataFields);
  const { snackbar, showErrorSnackbar } = useSnackbar();
  const { setSuccessNavigationSnackbar } = useNavigateSnackbar();
  const { errors, handleChange, handleInvalid, handleRefocus, setErrors } =
    useForm(setSubmitData);
  const { inputRef, handleChange: handleChangeRef, refData } = useRefForm();

  const handleSelectAll = (name) => (e) => {
    const { checked } = e.target;
    const value = groupMembers.reduce((acc, mbr) => {
      acc[mbr._id] = {
        value: "",
        isSelected: checked,
      };
      return acc;
    }, {});
    setSubmitData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangeAccordation = (name) => () =>
    setSubmitData((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));

  // handleChangeSingleCheckbox
  const handleChangeSingleCheckbox = (name, memberId) => (e) => {
    const { checked } = e.target;

    if (errors.includes(name)) {
      setErrors((prev) => prev.filter((err) => err !== name));
    }
    setSubmitData((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        [memberId]: {
          value: checked ? prev[name][memberId]?.["value"] || "" : "",
          isSelected: checked,
        },
      },
    }));
  };
  // handleChangeAmount
  const handleChangeAmount = (name, memberId) => (e) => {
    setErrors((prev) => prev.filter((err) => err !== e.target.name));
    setSubmitData((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        [memberId]: {
          ...prev[name][memberId],
          value: e.target.value,
        },
      },
    }));
  };

  const handleChangeSplitType = (e) => {
    handleChange(e);
    const _selectedSplitMembers = Object.entries(
      submitData.selectedSplitMembers
    ).reduce((acc, [memberId, dt]) => {
      acc[memberId] = {
        value: "",
        isSelected: submitData.selectedSplitMembers[memberId]["isSelected"],
      };

      return acc;
    }, {});

    setSubmitData((prev) => ({
      ...prev,
      selectedSplitMembers: _selectedSplitMembers,
    }));
  };

  // getSelectedMembersCount
  const getSelectedMembersCount = (name) => {
    const selectedMembersCount = Object.values(submitData[name]).reduce(
      (acc, dt) => {
        if (dt.isSelected) {
          acc += 1;
        }
        return acc;
      },
      0
    );
    return selectedMembersCount;
  };
  // getSelectAllCheckboxValue
  const getSelectAllCheckboxValue = (name) => {
    const allSelected = getSelectedMembersCount(name) === groupMembers.length;
    return allSelected;
  };
  // getSingleCheckboxValue
  const getSingleCheckboxValue = (name, memberId) => {
    return Boolean(submitData[name][memberId]?.["isSelected"]);
  };

  // getAmountTextFieldValue
  const getAmountTextFieldValue = (name, memberId) => {
    return submitData[name][memberId]?.["value"];
  };

  const getMemberPaidAmount = (memberId) => {
    return Number(submitData.selectedPaidMembers[memberId]?.["value"] || 0);
  };

  const totalMembersAmount = useMemo(() => {
    return (name) => {
      const items = submitData[name];
      return Object.values(items).reduce((acc, dt) => {
        if (dt.isSelected) {
          acc += Number(dt.value);
        }
        return acc;
      }, 0);
    };
  }, [submitData.selectedPaidMembers, submitData.selectedSplitMembers]);

  const splittedAmountDetails = useMemo(() => {
    const _selectedSplitMembersCount = Object.values(
      submitData.selectedSplitMembers
    ).reduce((acc, dt) => {
      if (dt.isSelected) {
        acc += 1;
      }
      return acc;
    }, 0);

    const splitType = submitData.selectedSplitType;
    const _membersSplittedAmountDetails = Object.entries(
      submitData.selectedSplitMembers
    ).reduce((acc, [memberId, dt]) => {
      if (dt.isSelected) {
        switch (splitType) {
          case Enums.splitTypeIds.EQUALLY:
            acc[memberId] = roundOff(
              submitData.expenseAmount / _selectedSplitMembersCount
            );

            break;
          case Enums.splitTypeIds.PARTIALLY:
            acc[memberId] = dt.value;
            break;
          case Enums.splitTypeIds.PROPORTIONALLY:
            acc[memberId] = roundOff(
              (dt.value / 100) * submitData.expenseAmount
            );
            break;
          default:
            {
            }
            break;
        }
      }
      return acc;
    }, {});
    return _membersSplittedAmountDetails;
  }, [
    submitData.selectedSplitMembers,
    submitData.expenseAmount,
    submitData.selectedSplitType,
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (getSelectedMembersCount("selectedPaidMembers") === 0) {
      showErrorSnackbar(
        "Please select at least one member who paid for the expense."
      );
      return;
    }
    if (getSelectedMembersCount("selectedSplitMembers") === 0) {
      showErrorSnackbar(
        "Please select at least one member for splitting the expense."
      );
      return;
    }
    if (submitData.expenseAmount != totalMembersAmount("selectedPaidMembers")) {
      showErrorSnackbar(
        "The total paid amount does not match the expense amount."
      );
      return;
    }
    const _totalSplitedAmount = Object.values(splittedAmountDetails).reduce(
      (acc, val) => acc + Number(val),
      0
    );
    if (submitData.expenseAmount != _totalSplitedAmount) {
      showErrorSnackbar(
        submitData.selectedSplitType === Enums.splitTypeIds.PARTIALLY
          ? "The total amount split does not match the expense amount."
          : "The sum of the split percentages should equal 100."
      );
      return;
    }
    const paidAmountDetails = Object.entries(
      submitData.selectedPaidMembers
    ).reduce((acc, [memberId, dt]) => {
      if (dt.isSelected) {
        acc[memberId] = dt.value;
      }
      return acc;
    }, {});
    const { response } = await fetchMethod(
      updateMode
        ? () =>
            UpdateExpense(
              data._id,
              groupId,
              refData.current.selectedDate,
              refData.current.description,
              Number(submitData.expenseAmount),
              paidAmountDetails,
              splittedAmountDetails
            )
        : () =>
            AddExpense(
              groupId,
              refData.current.selectedDate,
              refData.current.description,
              Number(submitData.expenseAmount),
              paidAmountDetails,
              splittedAmountDetails
            ),
      setSubmitData
    );
    if (response.status) {
      if (!updateMode) {
        setSuccessNavigationSnackbar(
          `${routesUrls.EXPENSES}/${groupDetails}`,
          response.msg
        );
      }
      handleGetExpenses();
      onClose();
    } else {
      showErrorSnackbar(response.msg);
      showObjErrors(response.errors, showErrorSnackbar);
    }
  };

  const geSelectedMemberForUpdate = (data) => {
    const paidMembers = data.paidMemberDetailsArray.reduce((acc, dt) => {
      acc[dt.memberId] = {
        value: dt.amountPaid,
        isSelected: true,
      };
      return acc;
    }, {});
    const splitMembers = data.splitMemberDetailsArray.reduce((acc, dt) => {
      acc[dt.memberId] = {
        value: dt.amountSplitted,
        isSelected: true,
      };
      return acc;
    }, {});
    return { paidMembers, splitMembers };
  };

  useEffect(() => {
    if (updateMode) {
      setSubmitData((prev) => ({
        ...prev,
        selectedPaidMembersOpen: true,
        selectedSplitMembersOpen: true,
        selectedSplitType: Enums.splitTypeIds.PARTIALLY,
        selectedPaidMembers: geSelectedMemberForUpdate(data).paidMembers,
        selectedSplitMembers: geSelectedMemberForUpdate(data).splitMembers,
        expenseAmount: data.expenseAmount,
      }));
    }
  }, [open]);

  return (
    <>
      <ModalComponent
        title={title}
        open={open}
        onClose={onClose}
        maxWidth={"sm"}
      >
        <form onInvalid={handleInvalid} onSubmit={handleSubmit}>
          <DialogContentComp>
            <GridContainer>
              <GridItem md={12}>
                <MyTextFieldLabel title={"Expense Date"} />
                <MyTextField
                  type={"date"}
                  errors={errors}
                  onFocus={handleRefocus}
                  defaultValue={
                    updateMode
                      ? dateFormatForInput(data.expenseDate)
                      : currentDate()
                  }
                  onChange={handleChangeRef}
                  inputRef={inputRef("selectedDate")}
                  name={"selectedDate"}
                />
              </GridItem>
              <GridItem md={12}>
                <MyTextFieldLabel title={"Description"} />
                <MyTextField
                  onFocus={handleRefocus}
                  errors={errors}
                  name={"description"}
                  onChange={handleChangeRef}
                  inputRef={inputRef("description")}
                  defaultValue={updateMode ? data.description : ""}
                />
              </GridItem>
              <GridItem md={12}>
                <MyTextFieldLabel title={"Amount"} />
                <MyTextField
                  type={"number"}
                  errors={errors}
                  value={submitData.expenseAmount}
                  onChange={handleChange}
                  name={"expenseAmount"}
                />
              </GridItem>
              <GridItem md={12}>
                <MyTextFieldLabel title={"Paid By"} />
                <MemberAccordation
                  expanded={submitData.selectedPaidMembersOpen}
                  onChange={handleChangeAccordation("selectedPaidMembersOpen")}
                  title={"Select Members"}
                >
                  <Box className={"flex_col"}>
                    <Box className={"flex_between"}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <CheckboxComponent
                          checked={getSelectAllCheckboxValue(
                            "selectedPaidMembers"
                          )}
                          onChange={handleSelectAll("selectedPaidMembers")}
                        />
                        <MyTextFieldLabel
                          required={false}
                          title={"Select All"}
                          color={primary}
                        />
                      </Box>
                      <MyTextFieldLabel
                        required={false}
                        title={<>Paid Amount</>}
                        color={primary}
                      />
                    </Box>
                    {groupMembers.map((mbr) => (
                      <>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <CheckboxComponent
                            value={getSingleCheckboxValue(
                              "selectedPaidMembers",
                              mbr._id
                            )}
                            checked={getSingleCheckboxValue(
                              "selectedPaidMembers",
                              mbr._id
                            )}
                            name={mbr.name}
                            onChange={handleChangeSingleCheckbox(
                              "selectedPaidMembers",
                              mbr._id
                            )}
                          />
                          <Box flexShrink={0}>
                            <Member name={mbr.name} src={mbr.profile} />
                          </Box>
                          {getSingleCheckboxValue(
                            "selectedPaidMembers",
                            mbr._id
                          ) && (
                            <Box
                              maxWidth={100}
                              className={"flex_between"}
                              width={"100%"}
                              ml={"auto"}
                            >
                              <MyTextField
                                variant="standard"
                                type={"number"}
                                value={getAmountTextFieldValue(
                                  "selectedPaidMembers",
                                  mbr._id
                                )}
                                name={`selectedPaidMembers_${mbr.name}`}
                                errors={errors}
                                onChange={handleChangeAmount(
                                  "selectedPaidMembers",
                                  mbr._id
                                )}
                              />
                            </Box>
                          )}
                        </Box>
                      </>
                    ))}
                    <Box sx={{ width: "100%", maxWidth: 140, ml: "auto" }}>
                      <MyTextFieldLabel
                        required={false}
                        title={
                          <>
                            Total : {totalMembersAmount("selectedPaidMembers")}
                          </>
                        }
                        color={"primary"}
                      />
                    </Box>
                  </Box>
                </MemberAccordation>
              </GridItem>
              <GridItem md={12}>
                <Box className={"flex_between"}>
                  <MyTextFieldLabel title={"Split On"} />
                  <Box sx={{ width: 125 }}>
                    <MyTextField
                      select
                      value={submitData.selectedSplitType}
                      onChange={handleChangeSplitType}
                      name={"selectedSplitType"}
                    >
                      {getOptions(Enums.splitTypeOptions).splitTypes}
                    </MyTextField>
                  </Box>
                </Box>
                <MemberAccordation
                  expanded={submitData.selectedSplitMembersOpen}
                  onChange={handleChangeAccordation("selectedSplitMembersOpen")}
                  title={"Select Members"}
                >
                  <Box className={"flex_col"}>
                    <Box className={"flex_between"}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <CheckboxComponent
                          label={"Select All"}
                          checked={getSelectAllCheckboxValue(
                            "selectedSplitMembers"
                          )}
                          onChange={handleSelectAll("selectedSplitMembers")}
                        />
                      </Box>
                      {submitData.selectedSplitType ===
                      Enums.splitTypeIds.PROPORTIONALLY ? (
                        <Box sx={{ display: "flex" }}>
                          <MyTextFieldLabel
                            required={false}
                            title={`Proportional`}
                            color={primary}
                          />
                          <MyTextFieldLabel
                            required={false}
                            title={"Amount"}
                            color={primary}
                          />
                        </Box>
                      ) : (
                        submitData.selectedSplitType ===
                          Enums.splitTypeIds.PARTIALLY && (
                          <MyTextFieldLabel
                            required={false}
                            title={`Partial Amount`}
                            color={primary}
                          />
                        )
                      )}
                    </Box>
                    {groupMembers.map((mbr) => {
                      return (
                        <>
                          {submitData.selectedSplitType ===
                          Enums.splitTypeIds.EQUALLY ? (
                            <Box className={"flex_between"}>
                              <Box className={"flex_center"}>
                                <CheckboxComponent
                                  value={getSingleCheckboxValue(
                                    "selectedSplitMembers",
                                    mbr._id
                                  )}
                                  checked={getSingleCheckboxValue(
                                    "selectedSplitMembers",
                                    mbr._id
                                  )}
                                  onChange={handleChangeSingleCheckbox(
                                    "selectedSplitMembers",
                                    mbr._id
                                  )}
                                />
                                <Box flexShrink={0}>
                                  <Member name={mbr.name} src={mbr.profile} />
                                </Box>
                              </Box>
                              {getSingleCheckboxValue(
                                "selectedSplitMembers",
                                mbr._id
                              ) && (
                                <Box className={"flex_between"}>
                                  <MyTextFieldLabel
                                    title={`-${splittedAmountDetails[mbr._id]}`}
                                    required={false}
                                    color={red}
                                  />
                                  <MyTextFieldLabel
                                    title={`+${getMemberPaidAmount(mbr._id)}`}
                                    required={false}
                                    color={green}
                                  />
                                  <MyTextFieldLabel
                                    title={`=`}
                                    required={false}
                                    color={primary}
                                  />
                                  <MyTextFieldLabel
                                    title={`${
                                      getMemberPaidAmount(mbr._id) >
                                      splittedAmountDetails[mbr._id]
                                        ? "+"
                                        : ""
                                    }${roundOff(
                                      getMemberPaidAmount(mbr._id) -
                                        splittedAmountDetails[mbr._id]
                                    )}`}
                                    required={false}
                                    color={
                                      getMemberPaidAmount(mbr._id) >=
                                      splittedAmountDetails[mbr._id]
                                        ? green
                                        : red
                                    }
                                  />
                                </Box>
                              )}
                            </Box>
                          ) : (
                            <Box className={"flex_between"}>
                              <Box sx={{ display: "flex" }}>
                                <CheckboxComponent
                                  value={getSingleCheckboxValue(
                                    "selectedSplitMembers",
                                    mbr._id
                                  )}
                                  checked={getSingleCheckboxValue(
                                    "selectedSplitMembers",
                                    mbr._id
                                  )}
                                  name={mbr.name}
                                  onChange={handleChangeSingleCheckbox(
                                    "selectedSplitMembers",
                                    mbr._id
                                  )}
                                />
                                <Box flexShrink={0}>
                                  <Member name={mbr.name} src={mbr.profile} />
                                </Box>
                              </Box>
                              {getSingleCheckboxValue(
                                "selectedSplitMembers",
                                mbr._id
                              ) && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <Box maxWidth={100}>
                                    <MyTextField
                                      variant="standard"
                                      type={"number"}
                                      value={getAmountTextFieldValue(
                                        "selectedSplitMembers",
                                        mbr._id
                                      )}
                                      name={`selectedSplitMembers_${mbr.name}`}
                                      errors={errors}
                                      onChange={handleChangeAmount(
                                        "selectedSplitMembers",
                                        mbr._id
                                      )}
                                    />
                                  </Box>
                                  {submitData.selectedSplitType ===
                                    Enums.splitTypeIds.PROPORTIONALLY && (
                                    <MyTextFieldLabel
                                      required={false}
                                      title={splittedAmountDetails[mbr._id]}
                                      color={primary}
                                    />
                                  )}
                                </Box>
                              )}
                            </Box>
                          )}
                        </>
                      );
                    })}
                    {(submitData.selectedSplitType ===
                      Enums.splitTypeIds.PARTIALLY ||
                      submitData.selectedSplitType ===
                        Enums.splitTypeIds.PROPORTIONALLY) && (
                      <Box sx={{ width: "100%", maxWidth: 140, ml: "auto" }}>
                        <MyTextFieldLabel
                          required={false}
                          title={
                            <>
                              Total :{" "}
                              {totalMembersAmount("selectedSplitMembers")}
                              {submitData.selectedSplitType ===
                                Enums.splitTypeIds.PROPORTIONALLY && "%"}
                            </>
                          }
                          color={"primary"}
                        />
                      </Box>
                    )}
                  </Box>
                </MemberAccordation>
              </GridItem>
            </GridContainer>
          </DialogContentComp>
          <DialogActions>
            <MyButton
              title={updateMode ? "Update" : "Save"}
              type={"Submit"}
              loading={submitData.loading}
            />
          </DialogActions>
        </form>
      </ModalComponent>
      <SnackBarComponent data={snackbar} />
    </>
  );
}
