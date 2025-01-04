<!DOCTYPE html>
<html>
<body>
    <h1>📍 Incident Alert Frontend</h1>
    <p>
        IncidentAlert is a project designed for reporting and managing incidents with integrated support for various tools such as Leaflet for OpenStreetMap, Google Translate, Google Places, and Geolocation. The application allows users to report incidents, view recent incidents, and filter incidents based on a specific date range.
    </p>

  <h2>✨ Features</h2>
    <ul>
        <li>🗺️ <strong>Interactive Map with Leaflet and OpenStreetMap:</strong> Users can easily report and view incidents on a dynamic map interface.</li>
        <li>🌐 <strong>Google Translate Support:</strong> The application currently translates incident descriptions; however, translation before saving to the database will be addressed in future updates.</li>
        <li>📍 <strong>Location Search with Google Places and Geolocation:</strong> Users can search for specific places and get their location automatically.</li>
        <li>📋 <strong>Incident Reporting and Viewing:</strong> Users can add new incidents and filter them based on the current day or a selected date range.</li>
        <li>🧭 <strong>Enhanced Navigation:</strong> Currently, a single click on the map places a marker, while a double-click opens a page displaying incidents for that location. This will be updated to a more user-friendly interface with navigation buttons.</li>
    </ul>

   <h2>⚙️ Setup Instructions</h2>
    <p>
        Before using the application, it is necessary to configure the backend service URL and the Google services API key. This can be done by setting the following values in <code>src/environments/config.development.json</code> and <code>src/environments/config.production.json</code>:
    </p>
    <pre>
{
  "baseServiceUrl": "",
  "REACT_APP_GOOGLE_API_KEY": ""
}
    </pre>

  <h2>📋 TODO</h2>
    <ul>
        <li>🧹 <strong>Code Clean-up:</strong> Refactor the codebase for improved readability, maintainability, and adherence to best practices.</li>
        <li>📦 <strong>Modularization:</strong> Restructure the project to separate functional logic and presentation within components.</li>
        <li>📱 <strong>Responsive Design:</strong> Implement a fully responsive UI to enhance usability on various screen sizes, including mobile devices.</li>
        <li>💡 <strong>Autocomplete Improvement:</strong> Fix the autocomplete feature for the Google Places API to ensure accurate and reliable location searches.</li>
        <li>🌐 <strong>Translation Adjustments:</strong> Modify the Google Translate integration so that incidents are not translated before being saved to the database, preserving the original language in records.</li>
        <li>🖼️ <strong>Map Interaction Update:</strong> Replace the double-click navigation with a button in the sidebar. After clicking on a location on the map, the user should be able to navigate to the incident details page for that location via a sidebar button.</li>
    </ul>
</body>
</html>
