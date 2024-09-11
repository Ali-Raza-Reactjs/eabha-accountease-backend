import { Box } from "@mui/material";
import React from "react";
import { DeleteIconButton, Member } from "../../utils/Helper";

export default function FriendsCard(props) {
  const { src, name, email, onClick } = props;

  return (
    <Box
      p={{ xs: "10px", md: "20px" }}
      x
      bgcolor={"#fff"}
      boxShadow={"0 1px 20px 0 rgba(69, 90, 100, 0.08)"}
      className={"flex_between"}
      gap={{ xs: 1, md: 2.5 }}
    >
      <Member src={src} name={name} email={email} />
      <DeleteIconButton onClick={onClick} />
    </Box>
  );
}
