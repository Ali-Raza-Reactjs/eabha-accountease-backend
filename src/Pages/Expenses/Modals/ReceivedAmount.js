import { DialogActions } from "@mui/material";
import React, { useState } from "react";
import { ReceivedAmount } from "../../../apis/Axios";
import MyButton from "../../../components/Buttons/MyButton";
import ModalComponent from "../../../components/Modals/ModalComponent";
import MyTextField from "../../../components/TextField/MyTextField";
import MyTextFieldLabel from "../../../components/TextField/MyTextFieldLabel";
import { getThisKeyCookie } from "../../../utils/Cookies";
import {
  DialogContentComp,
  Enums,
  GridContainer,
  GridItem,
  LoadingTextField,
  SwitchComponent,
  WhatsAppMsg,
  currentDate,
  decryptData,
  fetchMethod,
  getOptions,
  useForm,
  useGetAllMembers,
  useNavigateSnackbar,
  useWhatsAppMsg,
} from "../../../utils/Helper";
import { useLocation } from "react-router-dom";

export default function ReceivedAmountModal(props) {
  const { title, open, onClose, handleGetExpenses, groupMembers, groupId } =
    props;
  const { loading, members } = useGetAllMembers();
  const { whatsAppMsgRef, handleSendWhatsAppMsg } = useWhatsAppMsg();
  const { path } = useLocation();
  const initialSubmitDataFields = {
    loading: false,
    amount: "",
    selectedFromMember: "",
    selectedToMember: "",
    selectedFromMemberName: "",
    selectedFromMemberPhoneNum: "",
    selectedToMemberName: "",
    selectedToMemberPhoneNum: "",
    selectedDate: currentDate(),
    adminMode: false,
    comment: "",
  };
  const [submitData, setSubmitData] = useState(initialSubmitDataFields);
  const { errors, handleInvalid, handleChange, setErrors } =
    useForm(setSubmitData);
  const { setSuccessNavigationSnackbar } = useNavigateSnackbar();
  const handleOnClose = () => {
    setErrors([]);
    onClose();
  };

  const handleSubmit = async () => {
    const { response } = await fetchMethod(
      () =>
        ReceivedAmount(
          groupId,
          submitData.selectedDate,
          submitData.selectedFromMember,
          Number(submitData.amount),
          submitData.comment
        ),
      setSubmitData
    );
    if (response.status) {
      setSuccessNavigationSnackbar(path, response.msg);
      handleOnClose();
      handleGetExpenses();
    }
  };

  return (
    <>
      <ModalComponent
        title={title}
        open={open}
        onClose={handleOnClose}
        titleBtn={
          decryptData(getThisKeyCookie(Enums.cookiesKeys.MEMBER_ID)) ==
            Enums.members.ALI_RAZA && (
            <SwitchComponent
              color="primary"
              label={"Admin Mode"}
              checked={submitData.adminMode}
              onChange={(e) => {
                setSubmitData((prev) => ({
                  ...prev,
                  adminMode: e.target.checked,
                }));
              }}
            />
          )
        }
      >
        <form
          onInvalid={handleInvalid}
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <DialogContentComp>
            <GridContainer>
              <GridItem>
                <MyTextFieldLabel title={"Date"} />
                <MyTextField
                  type={"date"}
                  value={submitData.selectedDate}
                  onChange={handleChange}
                  errors={errors}
                  name={"selectedDate"}
                />
              </GridItem>
              <GridItem>
                <MyTextFieldLabel title="From Member" />
                {loading ? (
                  <LoadingTextField />
                ) : (
                  <MyTextField
                    select
                    value={submitData.selectedFromMember}
                    onChange={(e) => {
                      handleChange(e);
                      // const _selectedMember = members.find(
                      //   (mbr) => mbr._id === e.target.value
                      // );
                      // setSubmitData((prev) => ({
                      //   ...prev,
                      //   selectedFromMemberPhoneNum: _selectedMember.phone,
                      //   selectedFromMemberName: _selectedMember.name,
                      // }));
                    }}
                    errors={errors}
                    name={"selectedFromMember"}
                  >
                    {getOptions(groupMembers).groupMembers}
                  </MyTextField>
                )}
              </GridItem>
              <GridItem>
                <MyTextFieldLabel title={"Amount"} />
                <MyTextField
                  type={"number"}
                  value={submitData.amount}
                  onChange={handleChange}
                  errors={errors}
                  name={"amount"}
                />
              </GridItem>
              <GridItem>
                <MyTextFieldLabel title={"Comment"} />
                <MyTextField
                  value={submitData.comment}
                  onChange={handleChange}
                  errors={errors}
                  name={"comment"}
                />
              </GridItem>
            </GridContainer>
          </DialogContentComp>
          <DialogActions>
            <MyButton
              type={"submit"}
              title={"Save"}
              loading={submitData.loading}
            />
          </DialogActions>
        </form>
      </ModalComponent>

      <WhatsAppMsg
        phoneNumber={
          submitData.adminMode
            ? submitData.selectedToMemberPhoneNum
            : submitData.selectedFromMemberPhoneNum
        }
        whatsAppMsgRef={whatsAppMsgRef}
        message={
          submitData.adminMode
            ? `Dear ${submitData.selectedToMemberName},You have received an amount of ${submitData.amount} from ${submitData.selectedFromMemberName}.Please check ${window.location.origin}`
            : `Dear ${submitData.selectedFromMemberName},I have received an amount of ${submitData.amount}.Please check ${window.location.origin}`
        }
      />
    </>
  );
}
