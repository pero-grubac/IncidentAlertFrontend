# IncidentAlert

IncidentAlert is a project designed for reporting and managing incidents with integrated support for various tools such as Leaflet for OpenStreetMap, Google Translate, Google Places, and Geolocation. The application allows users to report incidents, view recent incidents, and filter incidents based on a specific date range.

## Features

- **Interactive Map with Leaflet and OpenStreetMap**: Users can easily report and view incidents on a dynamic map interface.
- **Google Translate Support**: The application currently translates incident descriptions; however, translation before saving to the database will be addressed in future updates.
- **Location Search with Google Places and Geolocation**: Users can search for specific places and get their location automatically.
- **Incident Reporting and Viewing**: Users can add new incidents and filter them based on the current day or a selected date range.
- **Enhanced Navigation**: Currently, a single click on the map places a marker, while a double-click opens a page displaying incidents for that location. This will be updated to a more user-friendly interface with navigation buttons.

## Setup Instructions

Before using the application, it is necessary to configure the backend service URL and the Google services API key. This can be done by setting the following values in `src/environments/config.development.json` and `src/environments/config.production.json`:

```json
{
  "baseServiceUrl": "",
  "REACT_APP_GOOGLE_API_KEY": ""
}

## TODO

- **Code Clean-up**: Refactor the codebase for improved readability, maintainability, and adherence to best practices.
- **Modularization**: Restructure the project to separate functional logic and presentation within components.
- **Responsive Design**: Implement a fully responsive UI to enhance usability on various screen sizes, including mobile devices.
- **Autocomplete Improvement**: Fix the autocomplete feature for the Google Places API to ensure accurate and reliable location searches.
- **Translation Adjustments**: Modify the Google Translate integration so that incidents are not translated before being saved to the database, preserving the original language in records.
- **Map Interaction Update**: Replace the double-click navigation with a button in the sidebar. After clicking on a location on the map, the user should be able to navigate to the incident details page for that location via a sidebar button.

