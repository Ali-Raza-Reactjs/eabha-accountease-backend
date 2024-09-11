import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import { GetSingleMemberData, UpdateProfile } from "../../apis/Axios";
import MyButton from "../../components/Buttons/MyButton";
import PageHeader from "../../components/PageHeader/PageHeader";
import MyTextField from "../../components/TextField/MyTextField";
import MyTextFieldLabel from "../../components/TextField/MyTextFieldLabel";
import ProfileImgUploader from "../../components/Uploader/ProfileImgUploader";
import { getThisKeyCookie, setThisKeyCookie } from "../../utils/Cookies";
import {
  Enums,
  GridContainer,
  GridItem,
  LoadingTextField,
  SnackBarComponent,
  SwitchComponent,
  decryptData,
  fetchMethod,
  pageGridSpacing,
  pagePadding,
  useForm,
  useSnackbar,
} from "../../utils/Helper";

export default function Profile() {
  const [memberData, setMemberData] = useState({
    data: {},
    loading: false,
  });
  const initialSubmitDataFields = {
    updateMode: false,
    name: "",
    phone: "",
    gmailId: "",
    selectedFile: "",
    loading: false,
    imgUrl: "",
  };
  const [submitData, setSubmitData] = useState(initialSubmitDataFields);

  const { snackbar, showSuccessSnackbar } = useSnackbar();
  const { errors, handleInvalid, handleChange, setErrors } =
    useForm(setSubmitData);

  const handleGetMemberData = async () => {
    const cookie_memberId = decryptData(
      getThisKeyCookie(Enums.cookiesKeys.MEMBER_ID)
    );
    const { response } = await fetchMethod(
      () => GetSingleMemberData(cookie_memberId),
      setMemberData
    );
    setMemberData((prev) => ({ ...prev, data: response?.data }));
    const data = response?.data;
    setThisKeyCookie(Enums.cookiesKeys.PROFILE_PHOTO, data?.profilePhoto);
    setThisKeyCookie(Enums.cookiesKeys.name, data?.name);
    setSubmitData((prev) => ({
      ...prev,
      name: data?.name,
      phone: data?.phone,
      gmailId: data?.gmailId,
      imgUrl: data?.profilePhoto,
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    const cookie_memberId = decryptData(
      getThisKeyCookie(Enums.cookiesKeys.MEMBER_ID)
    );

    const formData = new FormData();
    formData.append("memberId", cookie_memberId);
    formData.append("name", submitData.name);
    formData.append("phone", submitData.phone);
    formData.append("gmailId", submitData.gmailId);
    formData.append("profilePhoto", submitData.selectedFile);
    const { response } = await fetchMethod(
      () => UpdateProfile(formData),
      setSubmitData
    );
    if (response.status) {
      showSuccessSnackbar(response.message);

      handleGetMemberData();
      setSubmitData((prev) => ({ ...prev, updateMode: false }));
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };
  useEffect(() => {
    handleGetMemberData();
  }, []);
  return (
    <>
      <PageHeader title={"Profile"}>
        <SwitchComponent
          checked={submitData.updateMode}
          onChange={(e) => {
            setSubmitData((prev) => ({
              ...prev,
              updateMode: e.target.checked,
            }));
          }}
        />
      </PageHeader>
      <Box height={"100%"} px={pagePadding} mt={pageGridSpacing}>
        <GridContainer
          component={"form"}
          onSubmit={handleUpdateProfile}
          onInvalid={handleInvalid}
        >
          <GridItem md={12}>
            <ProfileImgUploader
              profileImg={submitData.imgUrl}
              updateMode={submitData.updateMode}
              file={submitData.selectedFile}
              handleDelete={() => {
                setSubmitData((prev) => ({
                  ...prev,
                  selectedFile: null,
                }));
              }}
              handleChange={(e) => {
                const file = e.target.files[0];
                setSubmitData((prev) => ({
                  ...prev,
                  selectedFile: file,
                }));
              }}
            />
          </GridItem>
          <GridItem>
            <MyTextFieldLabel title={"Name"} required={submitData.updateMode} />
            {memberData.loading ? (
              <LoadingTextField />
            ) : (
              <MyTextField
                disabled={!submitData.updateMode}
                value={submitData.name}
                onChange={handleChange}
                name={"name"}
                errors={errors}
              />
            )}
          </GridItem>
          <GridItem>
            <MyTextFieldLabel
              title={"Phone"}
              required={submitData.updateMode}
            />
            {memberData.loading ? (
              <LoadingTextField />
            ) : (
              <MyTextField
                type={"number"}
                disabled={!submitData.updateMode}
                value={submitData.phone}
                onChange={handleChange}
                name={"phone"}
                errors={errors}
              />
            )}
          </GridItem>
          <GridItem>
            <MyTextFieldLabel
              title={"Gmail Id"}
              required={submitData.updateMode}
            />
            {memberData.loading ? (
              <LoadingTextField />
            ) : (
              <MyTextField
                disabled={!submitData.updateMode}
                value={submitData.gmailId}
                onChange={handleChange}
                name={"gmailId"}
                errors={errors}
              />
            )}
          </GridItem>
          {submitData.updateMode && (
            <GridItem md={12} textAlign={"right"}>
              <MyButton
                title={"Update"}
                type={"submit"}
                loading={submitData.loading}
              />
            </GridItem>
          )}
        </GridContainer>
      </Box>
      <SnackBarComponent data={snackbar} />
    </>
  );
}
