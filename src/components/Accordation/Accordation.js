import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import React from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
export default function AccordationComp({
  expanded,
  onChange,
  title,
  children,
}) {
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
      <AccordionDetails sx={{ padding:1}}>
        {children}
      </AccordionDetails>
    </Accordion>
  );
}
