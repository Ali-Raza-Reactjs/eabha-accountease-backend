import { Box, Skeleton, Typography } from "@mui/material";
import PaidIcon from "@mui/icons-material/Paid";
import React from "react";
import {
  EyeShowHideIconButton,
  primary,
  secondary,
  useShowHide,
} from "../../utils/Helper";
import EyeButton from "../Buttons/EyeButton";

export default function AccountsCard(props) {
  const { cardTitle, amount, loading } = props;
  const { show: showMoney, handleShowHide: handleShowHideMoney } =
    useShowHide();
  return (
    <Box
      p={{ xs: "10px", md: "20px" }}
      bgcolor={"#fff"}
      boxShadow={"0 1px 20px 0 rgba(69, 90, 100, 0.08)"}
      className={"flex_column"}
      gap={{ xs: 1, md: 2.5 }}
    >
      <Typography variant="h6" color={secondary} fontWeight={600}>
        {cardTitle}
      </Typography>

      <Box className={"flex_between"}>
        {loading ? (
          <Skeleton animation="wave" variant="text" sx={{ width: 50 }} />
        ) : (
          <Typography variant="h4" color={primary}>
            {showMoney ? amount : `*****`}
          </Typography>
        )}
        <EyeShowHideIconButton show={showMoney} onClick={handleShowHideMoney} />
      </Box>
    </Box>
  );
}
