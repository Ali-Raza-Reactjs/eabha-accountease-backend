import { Box, DialogActions, ImageList, ImageListItem } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { AddGroup, UpdateGroup } from "../../../apis/Axios";
import AccordationComp from "../../../components/Accordation/Accordation";
import MyButton from "../../../components/Buttons/MyButton";
import ModalComponent from "../../../components/Modals/ModalComponent";
import MyTextField from "../../../components/TextField/MyTextField";
import MyTextFieldLabel from "../../../components/TextField/MyTextFieldLabel";
import GroupImgUploader from "../../../components/Uploader/GroupImgUploader";
import { routesUrls } from "../../../routes/urls";
import {
  CheckboxComponent,
  DialogContentComp,
  fetchMethod,
  getBooleanFromObject,
  green,
  GridContainer,
  GridItem,
  groupImgesUrls,
  LoadingTextField,
  Member,
  MenuComponent,
  red,
  showObjErrors,
  SnackBarComponent,
  useForm,
  useGetAllMembersForAddGroup,
  useMenu,
  useNavigateSnackbar,
  useSnackbar,
} from "../../../utils/Helper";

export default function AddUpdateGroupModal(props) {
  const { title, open, onClose, handleGetAllGroups, data } = props;
  const updateMode = getBooleanFromObject(data);

  const initialSubmitDataFields = {
    name: "",
    selectedMembers: {},
    selectedMembersOpen: false,
    selectedFile: "",
    imgUrl: "",
    loading: false,
    showImages: false,
  };
  const [submitData, setSubmitData] = useState(initialSubmitDataFields);
  const { loading: membersForAddLoading, membersForAddGroup } =
    useGetAllMembersForAddGroup(updateMode && data._id);
  const { snackbar, showErrorSnackbar } = useSnackbar();
  const { errors, handleInvalid, handleChange } = useForm(setSubmitData);
  const { setSuccessNavigationSnackbar } = useNavigateSnackbar();

  const checkedMemberlist = useMemo(() => {
    const checkedMembers = Object.entries(submitData.selectedMembers).reduce(
      (acc, [id, value]) => {
        if (value) {
          acc.push(id);
        }
        return acc;
      },
      []
    );
    return checkedMembers;
  }, [submitData.selectedMembers]);

  const handleSelectAll = () => (e) => {
    const { checked } = e.target;
    const value = membersForAddGroup.reduce((acc, mbr) => {
      acc[mbr._id] = checked;
      return acc;
    }, {});
    setSubmitData((prev) => ({
      ...prev,
      selectedMembers: value,
    }));
  };

  // getSelectedMembersCount
  const getSelectedMembersCount = (name) => {
    const selectedMembersCount = Object.values(
      submitData.selectedMembers
    ).reduce((acc, dt) => {
      if (dt) {
        acc += 1;
      }
      return acc;
    }, 0);
    return selectedMembersCount;
  };
  // getSelectAllCheckboxValue
  const getSelectAllCheckboxValue = (name) => {
    const allSelected =
      getSelectedMembersCount(name) === membersForAddGroup.length;
    return allSelected;
  };

  const handleAddUpdateGroup = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("img", submitData.selectedFile);
    formData.append("name", submitData.name);
    formData.append("members", String(checkedMemberlist));
    {
      updateMode && formData.append("groupId", data._id);
    }
    const { response } = await fetchMethod(
      updateMode ? () => UpdateGroup(formData) : () => AddGroup(formData)
    );
    if (response.status) {
      setSuccessNavigationSnackbar(routesUrls.EXPENSES, response.msg);
      handleGetAllGroups();
      onClose();
    } else {
      showObjErrors(response.errors, showErrorSnackbar);
    }
  };

  useEffect(() => {
    if (data) {
      const membersForAddGroup = data.members.reduce((acc, dt) => {
        acc[dt.memberId] = true;
        return acc;
      }, {});
      setSubmitData((prev) => ({
        ...prev,
        name: data.name,
        imgUrl: data.img,
        selectedFile: data.img,
        selectedMembers: membersForAddGroup,
        selectedMembersOpen: true,
      }));
    }
  }, []);

  const {
    anchorEl,
    open: openImgList,
    handleOpen: handleOpenImgList,
    handleClose: handleCloseImgList,
  } = useMenu();
  return (
    <>
      <ModalComponent
        title={title}
        open={open}
        onClose={onClose}
        maxWidth={"sm"}
      >
        <form onSubmit={handleAddUpdateGroup} onInvalid={handleInvalid}>
          <DialogContentComp>
            <GridContainer>
              <GridItem md={12} className={"flex_center"}>
                <GroupImgUploader
                  onClick={handleOpenImgList}
                  src={submitData.selectedFile}
                  handleDelete={() =>
                    setSubmitData((prev) => ({ ...prev, selectedFile: null }))
                  }
                />
              </GridItem>
              <MenuComponent
                open={openImgList}
                anchorEl={anchorEl}
                onClose={handleCloseImgList}
              >
                <GridItem md={12}>
                  <ImageList
                    cols={3}
                    // rowHeight={164}
                  >
                    {groupImgesUrls.map((item) => (
                      <ImageListItem
                        key={item}
                        sx={{ border: "1px solid" }}
                        onClick={() => {
                          setSubmitData((prev) => ({
                            ...prev,
                            selectedFile: item,
                          }));
                          handleCloseImgList();
                        }}
                      >
                        <img
                          srcSet={`${item}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                          src={`${item}?w=164&h=164&fit=crop&auto=format`}
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </GridItem>
              </MenuComponent>
              <GridItem md={12}>
                <MyTextFieldLabel title={"Name"} />
                <MyTextField
                  value={submitData.name}
                  onChange={handleChange}
                  name={"name"}
                  errors={errors}
                />
              </GridItem>
              <GridItem md={12}>
                <MyTextFieldLabel title={"Member(s)"} />
                {membersForAddLoading ? (
                  <LoadingTextField />
                ) : (
                  <AccordationComp
                    title={"Select Friend(s)"}
                    expanded={submitData.selectedMembersOpen}
                    onChange={() =>
                      setSubmitData((prev) => ({
                        ...prev,
                        selectedMembersOpen: !prev.selectedMembersOpen,
                      }))
                    }
                  >
                    <GridContainer>
                      <GridItem md={12} style={{ paddingTop: 0 }}>
                        <Box className={"flex_between"}>
                          <MyTextFieldLabel
                            title={"Select All"}
                            required={false}
                            color={"primary"}
                          />
                          <CheckboxComponent
                            value={getSelectAllCheckboxValue()}
                            checked={getSelectAllCheckboxValue()}
                            onChange={handleSelectAll()}
                          />
                        </Box>
                      </GridItem>

                      {membersForAddGroup.map((dt) => (
                        <GridItem md={12} key={dt._id}>
                          <Box className={"flex_between"}>
                            <Member
                              name={`${dt.firstName} ${dt.lastName}`}
                              src={dt.profile}
                              email={dt.email}
                            />
                            <Box className={"flex_center"}>
                              {updateMode && dt.groupId && (
                                <MyTextFieldLabel
                                  required={false}
                                  title={dt.expenseBalance}
                                  color={
                                    dt.expenseBalance === 0
                                      ? "primary"
                                      : dt.expenseBalance > 0
                                      ? green
                                      : red
                                  }
                                />
                              )}
                              <CheckboxComponent
                                disabled={dt.groupId && dt.expenseBalance !== 0}
                                value={Boolean(
                                  submitData.selectedMembers[dt._id]
                                )}
                                checked={Boolean(
                                  submitData.selectedMembers[dt._id]
                                )}
                                onChange={(e) => {
                                  setSubmitData((prev) => ({
                                    ...prev,
                                    selectedMembers: {
                                      ...prev.selectedMembers,
                                      [dt._id]: e.target.checked,
                                    },
                                  }));
                                }}
                              />
                            </Box>
                          </Box>
                        </GridItem>
                      ))}
                    </GridContainer>
                  </AccordationComp>
                )}
              </GridItem>
            </GridContainer>
          </DialogContentComp>
          <DialogActions>
            <MyButton
              disabled={!checkedMemberlist.length > 0}
              title={updateMode ? "Update" : "Save"}
              type={"submit"}
              loading={submitData.loading}
            />
          </DialogActions>
        </form>
      </ModalComponent>
      <SnackBarComponent data={snackbar} />
    </>
  );
}
