import { Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React from "react";
import { primary, secondary } from "../../utils/Helper";

export default function DataGridComp(props) {
  const {
    rows,
    columns,
    getRowId,
    // height = "65vh",
    checkboxSelection,
    pageSize = 5,
    rowHeight = 45,
    color = secondary,
    ...others
  } = props;

  return (
    <Box
      sx={{
        // height: height,
        width: "100%",
        "& .MuiCheckbox-root": {
          color: `${color} !important`,
        },
        "& .MuiDataGrid-main": {
          background: "#fff !important",
        },
        "& .MuiTablePagination-displayedRows": {
          marginBottom: 0,
        },
        "& .MuiDataGrid-footerContainer": {
          background: `${color} !important`,
          color: "#fff !important",
        },
        "& .MuiDataGrid-columnHeaders": {
          background: `${color} !important`,
          minHeight: "48px !important",
          maxHeight: "48px !important",
        },
        "& .MuiDataGrid-columnHeaderTitle": {
          color: "#fff !important",
        },
        "& .Mui-selected": {
          background: "#E6E1FD !important",
        },
        "& .MuiDataGrid-columnSeparator": {
          display: "none !important",
        },
        "& .MuiTablePagination-displayedRows": {
          color: "#fff !important",
        },
        "& .MuiButtonBase-root ": {
          color: "#fff !important",
        },
      }}
    >
      <DataGrid
        rowHeight={rowHeight}
        getRowId={getRowId}
        rows={rows}
        columns={columns}
        checkboxSelection={checkboxSelection}
        disableSelectionOnClick
        pageSize={pageSize}
        rowsPerPageOptions={[10]}
        autoHeight
        {...others}
      />
    </Box>
  );
}
