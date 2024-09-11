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
import React, { useEffect, useState } from "react";
import { DeleteGroup, GetAllGroups } from "../../apis/Axios";
import PageHeader from "../../components/PageHeader/PageHeader";
import {
  DeleteModal,
  GridContainer,
  GridItem,
  Member,
  NavigateSnackbar,
  PageHeaderButton,
  PageMainBox,
  SnackBarComponent,
  TableRowsLoader,
  fetchMethod,
  secondary,
  useDelete,
  useSnackbar,
} from "../../utils/Helper";

import AddUpdateGroupModal from "./Modals/AddUpdateGroup";
import EditButton from "../../components/Buttons/EditButton";
import DeleteButton from "../../components/Buttons/DeleteButton";
import ButtonBaseComp from "../../components/Buttons/ButtonBaseComp";
import { useNavigate } from "react-router-dom";
import { routesUrls } from "../../routes/urls";

export default function Expenses() {
  const navigate = useNavigate();
  const [addGroup, setAddGroup] = useState({
    open: false,
  });
  const [updateGroup, setUpdateGroup] = useState({
    open: false,
    data: {},
  });
  const [groups, setGroups] = useState({
    loading: true,
    data: [],
  });
  const [selectedRow, setSelectedRow] = useState({});
  const { snackbar, setSnackbar } = useSnackbar();

  const handleGetAllGroups = async () => {
    const { response } = await fetchMethod(GetAllGroups, setGroups);
    if (response.status) {
      setGroups((prev) => ({ ...prev, data: response.data }));
    }
  };

  const { deleteData, setDeleteData, handleDeleteClose, handleDelete } =
    useDelete(DeleteGroup, setSnackbar, () => {
      setGroups((prev) => ({
        ...prev,
        data: prev.data.filter((dt) => dt._id !== selectedRow._id),
      }));
      handleGetAllGroups();
    });

  useEffect(() => {
    handleGetAllGroups();
  }, []);
  return (
    <>
      <PageHeader title={"Expenses"}>
        <PageHeaderButton
          title={"+ Add Group"}
          onClick={() => setAddGroup((prev) => ({ ...prev, open: true }))}
        />
      </PageHeader>
      <PageMainBox>
        <GridContainer>
          <GridItem md={12}></GridItem>
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
                        Group
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ p: "16px 8px" }}>
                      <Typography
                        variant="h6"
                        fontWeight={600}
                        color={secondary}
                        minWidth={100}
                      >
                        Members
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ p: "16px 8px" }}>
                      <Typography
                        variant="h6"
                        fontWeight={600}
                        color={secondary}
                      >
                        Balance
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ p: "16px 8px" }}>
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
                  {groups.loading ? (
                    <TableRowsLoader columnsNum={3} />
                  ) : (
                    groups.data.map((row) => (
                      <TableRow key={row._id}>
                        <TableCell sx={{ p: "16px 8px" }}>
                          <ButtonBaseComp
                            onClick={() =>
                              navigate(`${routesUrls.EXPENSES}/${row.name}_${row._id}`)
                            }
                          >
                            <Member src={row.img} name={row.name} variant="rounded" />
                          </ButtonBaseComp>
                        </TableCell>
                        <TableCell sx={{ p: "16px 8px" }} align="center">
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            color={"primary"}
                          >
                            {row.members?.length}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ p: "16px 8px" }} align="right">
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            color={secondary}
                          >
                            {row.members?.length}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ p: "16px 8px" }} align="center">
                          <Box
                            className={"flex_center"}
                            gap={{ xs: 0.5, md: 1.5 }}
                          >
                            <EditButton
                              onClick={() => {
                                setUpdateGroup((prev) => ({
                                  ...prev,
                                  open: true,
                                  title: "Update Group",
                                  data: row,
                                }));
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
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </GridItem>
        </GridContainer>
      </PageMainBox>

      {/* Add Expense modal */}
      {addGroup.open && (
        <AddUpdateGroupModal
          title={"Add Group"}
          open={addGroup.open}
          onClose={() => setAddGroup((prev) => ({ ...prev, open: false }))}
          handleGetAllGroups={handleGetAllGroups}
        />
      )}
      {updateGroup.open && (
        <AddUpdateGroupModal
          title={"Update Group"}
          open={updateGroup.open}
          onClose={() => setUpdateGroup((prev) => ({ ...prev, open: false }))}
          data={updateGroup.data}
          handleGetAllGroups={handleGetAllGroups}
        />
      )}
      <SnackBarComponent data={snackbar} />
      <NavigateSnackbar />
      <DeleteModal
        deleteDetails={
          <>
            group of
            <br />
            Name : <b>{selectedRow.name} </b>
            <br />
            Member(s) : <b>{selectedRow.friends?.length} </b>
          </>
        }
        data={deleteData}
        onClose={handleDeleteClose}
        handleDelete={handleDelete}
      />
    </>
  );
}
