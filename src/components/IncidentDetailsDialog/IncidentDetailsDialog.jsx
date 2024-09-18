import React from "react";
import { Dialog, DialogContent, Box, Typography, Button } from "@mui/material";

const IncidentDetailsDialog = ({ open, onClose, incident }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "500px",
          padding: 0,
        }}
      >
        {/* Title Section */}
        <Box
          sx={{
            flex: "0 0 auto", // Sprječava širenje ove sekcije
            padding: 2,
            maxHeight: "100px", // Ograničava maksimalnu visinu naslova
            borderBottom: "1px solid #ddd",
            overflowY: "auto",
            overflowWrap: "break-word",
            wordBreak: "break-word",
          }}
        >
          <Typography variant="h6" component="div">
            {incident?.title}
          </Typography>
        </Box>

        {/* Text Section */}
        <Box
          sx={{
            flex: "1",
            padding: 2,
            borderBottom: "1px solid #ddd",
            overflowY: "auto",
            overflowWrap: "break-word",
            wordBreak: "break-word",
          }}
        >
          <Typography variant="h6" component="div">
            {incident?.text}
          </Typography>
        </Box>
        {/* Date Section */}
        <Box
          sx={{
            padding: 2,
            borderBottom: "1px solid #ddd",
          }}
        >
          <Typography color="text.secondary">
            {new Date(incident?.dateTime).toLocaleString()}
          </Typography>
        </Box>
        {/* Location Section */}
        <Box
          sx={{
            padding: 2,
            borderBottom: "1px solid #ddd",
          }}
        >
          <Typography variant="body2">
            Location: {incident?.location?.name}
          </Typography>
        </Box>

        {/* Categories Section */}
        <Box
          sx={{
            padding: 2,
            overflowY: "auto",
            overflowWrap: "break-word",
            wordBreak: "break-word",
          }}
        >
          <Typography variant="body2">
            Categories: {incident?.categories.map((cat) => cat.name).join(", ")}
          </Typography>
        </Box>

        <Box sx={{ padding: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button variant="contained" onClick={onClose}>
            Close
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default IncidentDetailsDialog;
