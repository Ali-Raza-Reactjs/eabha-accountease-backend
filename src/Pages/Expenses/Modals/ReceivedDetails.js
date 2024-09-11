import React from "react";
import {
  amountFormat,
  DialogContentComp,
  green,
  Member,
  red,
  secondary,
  TableRowsLoader,
} from "../../../utils/Helper";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ModalComponent from "../../../components/Modals/ModalComponent";

export default function ReceivedDetailsModal(props) {
  const { open, onClose, data } = props;

  return (
    <ModalComponent
      open={open}
      onClose={onClose}
      title={`Members History`}
      maxWidth={"sm"}
    >
      <DialogContentComp>
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            boxShadow: "0 1px 20px 0 rgba(69, 90, 100, 0.08)",
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ px: 1 }}>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    color={secondary}
                    minWidth={150}
                  >
                    Member
                  </Typography>
                </TableCell>

                <TableCell align="center" sx={{ px: 1 }}>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    color={secondary}
                    minWidth={100}
                  >
                    Given Amount
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={{ px: 1 }}>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    color={secondary}
                    minWidth={120}
                  >
                    Received Amount
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.loading ? (
                <TableRowsLoader rowsNum={4} columnsNum={3} />
              ) : (
                data.data.map((dt, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Member src={dt.profile} name={dt.name} />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="h6" color={green}>
                        {amountFormat(dt.givenAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="h6" color={red}>
                        {amountFormat(dt.receivedAmount)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContentComp>
    </ModalComponent>
  );
}
