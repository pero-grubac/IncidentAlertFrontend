import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import axios from "axios";

import ReactCountryFlag from "react-country-flag";
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
  const [selectedImage, setSelectedImage] = useState(null);
  const [language, setLanguage] = useState("sr");
  const [translatedText, setTranslatedText] = useState(incident?.text);
  const [loading, setLoading] = useState(false);

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const handleCloseImagePreview = () => {
    setSelectedImage(null);
  };
  const translateText = async (text, targetLang) => {
    try {
      setLoading(true);
      const response = await axios.post(
        "https://libretranslate.com/translate",
        {
          q: text,
          source: "auto",
          target: targetLang,
          format: "text",
        }
      );
      setLoading(false);
      return response.data.translatedText;
    } catch (error) {
      setLoading(false);
      console.error("Translation error:", error);
      return text;
    }
  };
  const handleLanguageChange = async (event) => {
    const newLang = event.target.value;
    setLanguage(newLang);
    const langCode = newLang === "sr" ? "sr" : "en";

    const translated = await translateText(incident?.text, langCode);
    setTranslatedText(translated);
  };

  useEffect(() => {
    const initialTranslation = async () => {
      if (language !== "sr") {
        const translated = await translateText(incident?.text, language);
        setTranslatedText(translated);
      } else {
        setTranslatedText(incident?.text);
      }
    };
    initialTranslation();
  }, [language, incident?.text]);
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
            {loading ? ( // Display loading state
              <Typography variant="h6" component="div">
                Translating...
              </Typography>
            ) : (
              <Typography variant="h6" component="div">
                {translatedText}
              </Typography>
            )}
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
          {/* Close and Language Selector Section */}
          <Box
            sx={{
              padding: 2,
              display: "flex",
              justifyContent: "space-between", // Space between close button and language selector
              alignItems: "center",
            }}
          >
            {/* Language Selector */}
            <FormControl sx={{ width: "120px" }}>
              {" "}
              {/* Matches button width */}
              <Select
                labelId="language-select-label"
                value={language}
                onChange={handleLanguageChange}
                sx={{
                  height: "40px", // Set the height to match the button
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <MenuItem value="sr">
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <ReactCountryFlag
                      countryCode="RS"
                      svg
                      style={{ width: "20px", marginRight: "8px" }}
                    />
                    SR
                  </Box>
                </MenuItem>
                <MenuItem value="en">
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <ReactCountryFlag
                      countryCode="US"
                      svg
                      style={{ width: "20px", marginRight: "8px" }}
                    />
                    EN
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>{" "}
            <Button
              variant="contained"
              onClick={onClose}
              sx={{ height: "40px" }}
            >
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
