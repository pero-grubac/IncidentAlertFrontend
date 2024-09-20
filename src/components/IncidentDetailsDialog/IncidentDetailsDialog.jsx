import React, { useState } from "react";
import { Dialog, DialogContent, Box, Typography, Button } from "@mui/material";
const ImagePreviewDialog = ({ open, onClose, imageUrl }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <img
          src={imageUrl}
          alt="Full-size preview"
          style={{ maxWidth: "100%", maxHeight: "80vh" }}
        />
      </DialogContent>
    </Dialog>
  );
};
const IncidentDetailsDialog = ({ open, onClose, incident }) => {
  const [selectedImage, setSelectedImage] = useState(null); // Store the selected image for preview

  const handleImageClick = (imageUrl) => {
    console.log(imageUrl);
    setSelectedImage(imageUrl); // Set the clicked image for full preview
  };

  const handleCloseImagePreview = () => {
    setSelectedImage(null); // Close the full-size image preview
  };
  return (
    <>
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
              Categories:{" "}
              {incident?.categories.map((cat) => cat.name).join(", ")}
            </Typography>
          </Box>
          {incident?.images && incident.images.length > 0 && (
            <Box
              sx={{
                padding: 2,
                borderTop: "1px solid #ddd",
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                justifyContent: "center",
              }}
            >
              {incident.images.map((imageUrl, index) => (
                <Box key={index} sx={{ position: "relative" }}>
                  <img
                    src={imageUrl}
                    alt={`Preview ${index + 1}`}
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      cursor: "pointer",
                      borderRadius: 4,
                    }}
                    onClick={() => handleImageClick(imageUrl)} // Set the clicked image for full preview
                  />
                </Box>
              ))}
            </Box>
          )}
          <Box sx={{ padding: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button variant="contained" onClick={onClose}>
              Close
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
      {selectedImage && (
        <ImagePreviewDialog
          open={!!selectedImage}
          onClose={handleCloseImagePreview}
          imageUrl={selectedImage}
        />
      )}
    </>
  );
};

export default IncidentDetailsDialog;
