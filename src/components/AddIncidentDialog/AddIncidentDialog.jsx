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

const AddIncidentDialog = ({
  open,
  onClose,
  newIncidentText,
  setNewIncidentText,
  selectedCategories,
  setSelectedCategories,
  categories,
  onAddIncident,
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
            minRows={10}
            maxRows={10}
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

        {/* Date Section */}
        <Box
          sx={{
            padding: 2,
            borderBottom: "1px solid #ddd",
          }}
        >
          <Typography color="text.secondary">
            Date: {new Date().toLocaleString()}
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
            Location: {locationName}
          </Typography>
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

        <Button
          variant="contained"
          color="primary"
          onClick={onAddIncident}
        >
          Add Incident
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default AddIncidentDialog;
