import React from "react";
import {
  Dialog,
  DialogContent,
  Box,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Button,
  Typography,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const AddIncidentDialog = ({
  open,
  onClose,
  newIncidentText,
  setNewIncidentText,
  newIncidentTitle,
  setNewIncidentTitle,
  selectedCategories,
  setSelectedCategories,
  categories,
  onAddIncident,
  newIncidentDateTime,
  setNewIncidentDateTime,
}) => {
  const handleCategoryChange = (event) => {
    const selectedValues = event.target.value;
    const selectedObjects = categories.filter((cat) =>
      selectedValues.includes(cat.name)
    );
    setSelectedCategories(selectedObjects);
  };
  const { locationName } = useParams();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          padding: 2,
          height: "500px",
        }}
      >
        {/* Title Section */}
        <Box
          sx={{
            flex: "1",
            marginBottom: 2,
          }}
        >
          <TextField
            fullWidth
            label="Incident Title"
            multiline
            minRows={1}
            maxRows={1}
            value={newIncidentTitle}
            onChange={(e) => setNewIncidentTitle(e.target.value)}
          />
        </Box>
        {/* Text Section */}
        <Box
          sx={{
            flex: "1",
            marginBottom: 2,
          }}
        >
          <TextField
            fullWidth
            label="Incident Text"
            multiline
            minRows={8}
            maxRows={8}
            value={newIncidentText}
            onChange={(e) => setNewIncidentText(e.target.value)}
            sx={{
              "& .MuiInputBase-root": {
                height: "100%",
                minHeight: "150px",
              },
              "& .MuiFormControl-root": {
                margin: 0,
                padding: 0,
              },
            }}
          />
        </Box>

        {/* Location Section */}
        <Box
          sx={{
            padding: 2,

            border: "1px solid #ddd", // Add border around the box
            borderRadius: 1, // Optional: to add rounded corners
            marginBottom: 2,
          }}
        >
          <Typography variant="body2">Location: {locationName}</Typography>
        </Box>

        {/* Category Section */}
        <Box sx={{ marginBottom: 2 }}>
          <FormControl fullWidth size="small">
            <Select
              multiple
              value={selectedCategories.map((cat) => cat.name)}
              onChange={handleCategoryChange}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Typography key={value}>{value}</Typography>
                  ))}
                </Box>
              )}
              displayEmpty
            >
              <MenuItem value="" disabled>
                <em>Select Categories</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.name}>
                  <Checkbox
                    checked={selectedCategories
                      .map((cat) => cat.name)
                      .includes(category.name)}
                  />
                  <ListItemText primary={category.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* DateTime Section and Add Button Side by Side */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 2px", // Adjust the padding here
            marginBottom: 1,
          }}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ flex: 1, marginRight: 1 }}>
              <DateTimePicker
                label="Incident Date and Time"
                value={newIncidentDateTime || dayjs()}
                onChange={(newValue) => setNewIncidentDateTime(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Box>
          </LocalizationProvider>

          <Button variant="contained" color="primary" onClick={onAddIncident}>
            Add Incident
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AddIncidentDialog;
