// Global variables
const countryDropdown = document.getElementById("allCountries");
const search = document.getElementById("countrySearchInput");
let selectedTravelCountryCode = null; // To store the selected country code
let countryArray = []; // To store the list of all country options
let allTravelData = null; // To cache fetched country data
let windyAPI = null; // Windy API object for map interaction
let xxsCountries = [
  "VA",
  "TV",
  "SG",
  "SC",
  "SM",
  "PM",
  "MF",
  "KN",
  "SH",
  "BL",
  "PN",
  "PW",
  "NF",
  "NU",
  "MS",
  "MC",
  "MO",
  "AI",
  "AW",
  "BB",
  "BM",
  "CX",
  "GI",
  "HK",
  "JE",
  "LI",
  "YT",
];
let xsCountries = [
  "KY",
  "VI",
  "TC",
  "WS",
  "VC",
  "LC",
  "RE",
  "PR",
  "MU",
  "MQ",
  "MT",
  "AD",
  "AG",
  "BH",
  "VG",
  "BN",
  "BI",
  "CC",
  "KM",
  "CK",
  "DM",
  "GP",
  "GU",
  "GG",
  "IM",
  "JM",
  "LU",
];
let smCountries = [
  "KW",
  "XK",
  "GM",
  "GQ",
  "SV",
  "TL",
  "WF",
  "AE",
  "UG",
  "TT",
  "TO",
  "TW",
  "CH",
  "SZ",
  "SR",
  "LK",
  "GS",
  "SI",
  "SK",
  "SL",
  "SN",
  "ST",
  "RW",
  "QA",
  "PA",
  "PS",
  "MP",
  "NI",
  "NC",
  "NL",
  "NP",
  "ME",
  "MD",
  "MK",
  "LT",
  "LR",
  "LS",
  "LB",
  "LV",
  "KG",
  "KI",
  "JO",
  "IL",
  "IE",
  "HU",
  "HN",
  "HT",
  "GW",
  "GT",
  "GD",
  "GE",
  "GA",
  "PF",
  "GF",
  "FJ",
  "FO",
  "FK",
  "EE",
  "ER",
  "DO",
  "DJ",
  "DK",
  "CZ",
  "AL",
  "AS",
  "AM",
  "AT",
  "AZ",
  "BD",
  "BE",
  "BZ",
  "BA",
  "BF",
  "KH",
  "CV",
  "CR",
  "HR",
  "CU",
  "CY",
];
let medCountries = [
  "ZW",
  "ZM",
  "YE",
  "EH",
  "VU",
  "UY",
  "TN",
  "TG",
  "TJ",
  "SY",
  "ES",
  "SS",
  "KR",
  "SB",
  "RO",
  "CG",
  "PT",
  "PL",
  "PY",
  "PG",
  "OM",
  "KP",
  "NG",
  "MV",
  "MW",
  "LA",
  "KE",
  "IS",
  "GY",
  "GN",
  "GR",
  "GH",
  "BY",
  "BJ",
  "BT",
  "BW",
  "BG",
  "CM",
  "CF",
  "EC",
  "IQ",
  "IT",
  "CI",
];
let lgCountries = [
  "VN",
  "VE",
  "UZ",
  "GB",
  "UA",
  "TM",
  "TR",
  "TH",
  "TZ",
  "SJ",
  "SD",
  "ZA",
  "SO",
  "RS",
  "SA",
  "PH",
  "PE",
  "PK",
  "NO",
  "NE",
  "NZ",
  "NA",
  "MM",
  "MZ",
  "MA",
  "MN",
  "FM",
  "MX",
  "MR",
  "MH",
  "ML",
  "MY",
  "MG",
  "LY",
  "KZ",
  "JP",
  "DE",
  "FR",
  "FI",
  "ET",
  "AF",
  "DZ",
  "AO",
  "BS",
  "BO",
  "TD",
  "CO",
  "CD",
  "EG",
  "IN",
  "ID",
  "IR",
];
let xlCountries = ["AR", "AU", "BR", "CL", "CN", "SZ", "SE"];
let xxlCountries = ["CA", "GL", "RU", "US"];

var map = L.map("map").setView([51.505, -0.09], 13);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "© OpenStreetMap",
}).addTo(map);

var popup = L.popup();

function onMapClick(e) {
  popup
    .setLatLng(e.latlng)
    .setContent("You clicked the map at " + e.latlng.toString())
    .openOn(map);
}

map.on("click", onMapClick);

$(document).ready(function () {
  // Show the 'About' modal when the link is clicked
  $("#aboutLink").click(function () {
    $("#aboutProjectModal").modal("show");
  });
});

// Event listener for the country dropdown options
countryDropdown.parentElement.addEventListener("click", async (event) => {
  if (event.target.classList.contains("dropdown-item")) {
    selectedTravelCountryCode = event.target.getAttribute("dropdown-options");
    if (selectedTravelCountryCode) {
      // Set the search input value and selected code attribute
      search.value = event.target.textContent;
      console.log("Set search input value:", search.value);
      search.setAttribute("menu-selected-option", selectedTravelCountryCode);
      search.value = ""; // Reset search input value

      // Find the selected option based on the country code
      const selectedOption = countryArray.find(
        (option) => option.code === selectedTravelCountryCode
      );

      if (selectedOption) {
        // Update dropdown value, fetch and display country details, update map
        countryDropdown.value = selectedOption.code;
        await getAllTravelData(selectedOption.code);
        // Call getBounds to get lat and lng
        const { lat, lng } = await getBounds(selectedTravelCountryCode);
        // Get the zoom level for the selected country
        const zoomLevel = getZoomLevel(selectedTravelCountryCode);
        // Pass lat, lng, and zoom level to setMapLocation
        setMapLocation(
          lat,
          lng,
          generatePopupContent(selectedTravelCountryCode),
          zoomLevel
        );
      }
    }
  }
});

// Event listener for the search input (typing)
search.addEventListener("input", async () => {
  const searchTerm = search.value.trim().toLowerCase();
  // Filter options based on the search term
  const filteredOptions = countryArray.filter(
    (option) =>
      option.name.toLowerCase().includes(searchTerm) ||
      option.code.toLowerCase().includes(searchTerm)
  );
  appendDropdownOptions(filteredOptions);
  console.log("Filtered options based on search:", filteredOptions);
});

// Event listener for clicking the the search input
search.addEventListener("click", async () => {
  // If the search input is empty, populate the country dropdown
  if (search.value.trim() === "") {
    //.trim ignores spaces
    console.log("Populating country dropdown...");
    appendDropdownOptions(countryArray); //await populateCountryDropdown(); was causing the menu to load previous search after second click
  }
  console.log("Populated country dropdown");
});

// Function to fetch country data from travel advisory api and store it locally
async function fetchCountryData() {
  const apiUrl = "https://www.travel-advisory.info/api";
  try {
    const response = await fetch(apiUrl);
    const { data: travelData } = await response.json();
    return travelData;
  } catch (error) {
    console.error("Error fetching country data:", error);
    return null;
  }
}

// Function to populate the country dropdown
async function populateCountryDropdown() {
  try {
    const travelData = await fetchCountryData();
    countryArray = alphabetizeCountries(travelData);
    console.log("Populated countryArray with travel data:", countryArray);
  } catch (error) {
    console.error("Error fetching country data:", error);
  }
}

// Function to append dropdown options
function appendDropdownOptions(travelData) {
  countryDropdown.innerHTML = "";
  const placeholderOption = document.createElement("li");
  placeholderOption.innerHTML =
    '<a class="dropdown-item disabled" href="#" dropdown-options="">Select a Country...</a>';
  countryDropdown.appendChild(placeholderOption);

  for (const option of travelData) {
    const optionElement = document.createElement("li");
    optionElement.innerHTML = `<a class="dropdown-item" href="#" dropdown-options="${option.code}">${option.name}</a>`;
    countryDropdown.appendChild(optionElement);
  }
  // Log the updated countryArray array
  console.log("Updated countryArray:", countryArray);
}

// Function to get country data from the cache
async function getAllTravelData() {
  if (allTravelData !== null) {
    console.log("Cached country data in allTravelData:", allTravelData);
    return allTravelData;
  }

  try {
    const travelData = await fetchCountryData();
    allTravelData = travelData;
    console.log("Cached country data in allTravelData:", allTravelData);
    return allTravelData[selectedTravelCountryCode];
  } catch (error) {
    console.error("Error fetching country data:", error);
    throw error;
  }
}

// Function to set map location and add a marker with popup
function setMapLocation(lat, lng, popupContent, zoomLevel) {
  if (!map) {
    console.error("Map not provided!");
    return;
  }

  map;

  map.setView([lat, lng], zoomLevel); // Set the provided zoom level

  // Call the addMarker function to add a marker with popup
  addMarker(map, lat, lng, popupContent);

  console.log("Map location set:", lat, lng);
}

// Helper function to add a marker with a popup, removing existing marker if it exists
function addMarker(map, lat, lng, popupContent) {
  if (!map) {
    console.error("Map not provided!");
    return;
  }

  // Remove existing markers from the map
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      layer.remove();
    }
  });

  // Add a new marker to the map
  const marker = L.marker([lat, lng]).addTo(map);

  // Create a popup for the marker
  const popup = L.popup().setContent(popupContent);

  // Bind the popup to the marker and open it
  marker.bindPopup(popup).openPopup();
}

// Helper function to generate popup content
function generatePopupContent(selectedTravelCountryCode) {
  // Retrieve selected country's data from cache
  const selectedCountryData = allTravelData[selectedTravelCountryCode];

  if (selectedCountryData) {
    const advisory = selectedCountryData.advisory;

    // Construct popup content
    const popupContent = `
      <h5>${selectedCountryData.name}</h5>
      <p class="advisory-message">Advisory: ${advisory.message}</p>
      <a href="${advisory.source}" target="_blank" rel="noopener noreferrer">Source: ${advisory.sources_active}</a>
    `;

    // Log the generated popup content
    console.log("Popup Content:", popupContent);

    return popupContent;
  } else {
    return "";
  }
}

async function getBounds(selectedTravelCountryCode) {
  try {
    const OPEN_CAGE_API_KEY = "0c9aade54fba4c8abfae724859a72795";
    const selectedTravelOption = countryArray.find(
      (option) => option.code === selectedTravelCountryCode
    );
    const geocodingApiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
      selectedTravelOption.name
    )}&key=${OPEN_CAGE_API_KEY}`;

    console.log("Fetching geocoding data from API...");
    // Fetch geocoding data from the API
    const response = await fetch(geocodingApiUrl);
    const { results } = await response.json();

    if (results && results.length > 0) {
      const { lat, lng } = results[0].geometry;

      console.log("Geocoding results:", results);
      console.log("Marker coordinates:", lat, lng);

      // Return the lat and lng values
      return { lat, lng };
    }
  } catch (error) {
    console.error("Error updating map with geocoding:", error);
  }
}

const getZoomLevel = (selectedTravelCountryCode) => {
  if (xxsCountries.includes(selectedTravelCountryCode)) {
    return 11;
  }
  if (xsCountries.includes(selectedTravelCountryCode)) {
    return 9;
  }
  if (smCountries.includes(selectedTravelCountryCode)) {
    return 7;
  }
  if (medCountries.includes(selectedTravelCountryCode)) {
    return 6;
  }
  if (lgCountries.includes(selectedTravelCountryCode)) {
    return 5;
  }
  if (xlCountries.includes(selectedTravelCountryCode)) {
    return 4;
  }
  if (xxlCountries.includes(selectedTravelCountryCode)) {
    return 3;
  } else {
    console.log("you didnt set a zoom level for this country");
  }
};

// Helper function to alphabetize country options
function alphabetizeCountries(travelData) {
  // Create an array of country options with code and name properties
  const countryOptions = Object.keys(travelData).map(
    (selectedTravelCountryCode) => ({
      code: selectedTravelCountryCode,
      name: travelData[selectedTravelCountryCode].name,
    })
  );

  // Sort country options alphabetically by name
  return countryOptions.sort((a, b) => a.name.localeCompare(b.name));
}

// Initial population of the country dropdown and Windy API initialization
console.log("Initializing Windy API and populating country dropdown...");
populateCountryDropdown();
// initWindy();
