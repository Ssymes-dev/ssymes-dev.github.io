// Global variables
const countryDropdown = document.getElementById("allCountries");
const search = document.getElementById("countrySearchInput");
let countryArray = []; // To store the list of all country options
let allTravelData = null; // To cache fetched country data
let windyAPI; // Windy API object for map interaction
let extraSmallCountries = [];
let smallCountries = [];
let mediumCountries = [];
let largeCountries = [];

// Initialization
const initWindyOptions = {
  key: "9N1YXUo4GoPgLBOjB85IYsz5CwIUgzce",
  verbose: false,
  lat: 50.4,
  lng: 14.3,
  zoom: 5,
};

$(document).ready(function () {
  // Show the 'About' modal when the link is clicked
  $("#aboutLink").click(function () {
    $("#aboutProjectModal").modal("show");
  });
});

// Event listener for the country dropdown options
countryDropdown.parentElement.addEventListener("click", async (event) => {
  if (event.target.classList.contains("dropdown-item")) {
    const selectedTravelCountryCode =
      event.target.getAttribute("dropdown-options");
    if (selectedTravelCountryCode) {
      // Set the search input value and selected code attribute
      search.value = event.target.textContent;
      console.log("Set search input value:", search.value);
      search.setAttribute("menu-selected-option", selectedTravelCountryCode);
      search.value = ""; // Reset search input value

      // Find the selected option based on the country code
      const selectedOption = countryArray.find(
        ({ code }) => code === selectedTravelCountryCode
      );

      if (selectedOption) {
        // Update dropdown value, fetch and display country details, update map
        countryDropdown.value = selectedOption.code;
        await getAllTravelData(selectedOption.code);
        // Pass windyAPI.map as the second argument to getBounds
        await getBounds(selectedOption.code, windyAPI.map);
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
async function getAllTravelData(travelCountryCode) {
  if (allTravelData !== null) {
    return allTravelData[travelCountryCode];
  }

  try {
    const travelData = await fetchCountryData();
    allTravelData = travelData;
    console.log("Cached country data in allTravelData:", allTravelData);
    return allTravelData[travelCountryCode];
  } catch (error) {
    console.error("Error fetching country data:", error);
    throw error;
  }
}

// Function to set map location and add a marker with popup

function setMapLocation(lat, lon, popupContent) {
  windyInit(initWindyOptions, (windyAPI) => {
    const map = windyAPI.map;
    const zoomLevel = getZoomLevel(travelCountryCode);

    map.setView([lat, lon], zoomLevel);

    // Call the addMarker function to add a marker with popup
    addMarker(map, lat, lng, popupContent);

    console.log("Map location set:", lat, lng);
  });
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

// Function to add event listeners to dropdown options
function addEventListenersToOptions() {
  const dropdownOptions = document.querySelectorAll(".dropdown-item");

  dropdownOptions.forEach((option) => {
    option.addEventListener("click", async () => {
      try {
        const selectedDropdownOption = option.getAttribute("data-country-code");

        if (selectedDropdownOption) {
          countrySearchInput.value = option.textContent;
          countrySearchInput.setAttribute(
            "menu-selected-option",
            selectedDropdownOption
          );

          const selectedOption = countryArray.find(
            ({ code }) => code === selectedDropdownOption
          );

          if (selectedOption) {
            countryDropdown.value = selectedOption.code;
            // Display country details and update the map
            await displayCountryDetails(selectedOption.code);
          }
        }
      } catch (error) {
        console.error("Error handling dropdown option click:", error);
      }
    });
  });
}

// Helper function to generate popup content
function generatePopupContent(travelCountryCode) {
  // Retrieve selected country's data from cache
  const selectedCountryData = allTravelData[travelCountryCode];

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

async function getBounds(travelCountryCode) {
  try {
    const OPEN_CAGE_API_KEY = "0c9aade54fba4c8abfae724859a72795";
    const selectedTravelOption = countryArray.find(
      (option) => option.code === travelCountryCode
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

      if (results && results.length > 0) {
        const { lat, lng } = results[0].geometry;

        console.log("Geocoding results:", results);
        console.log("Marker coordinates:", lat, lng);
      }

      setMapLocation(lat, lng, generatePopupContent(travelCountryCode));
    }
  } catch (error) {
    console.error("Error updating map with geocoding:", error);
  }
}

const getZoomLevel = (travelCountryCode) => {
  if (extraSmallCountries.includes(travelCountryCode)) {
    return 11;
  }
  if (smallCountries.includes(travelCountryCode)) {
    return 7;
  }
  if (mediumCountries.includes(travelCountryCode)) {
    return 5;
  }
  if (largeCountries.includes(travelCountryCode)) {
    return 3;
  } else {
    console.log("you didnt set a zoom level for this country");
  }
};

// Helper function to alphabetize country options
function alphabetizeCountries(travelData) {
  // Create an array of country options with code and name properties
  const countryOptions = Object.keys(travelData).map((travelCountryCode) => ({
    code: travelCountryCode,
    name: travelData[travelCountryCode].name,
  }));

  // Sort country options alphabetically by name
  return countryOptions.sort((a, b) => a.name.localeCompare(b.name));
}

// Function to initialize the Windy API
const windy = windyInit(initWindyOptions, (api) => {
  windyAPI = api; // Store the initialized API object in the global variable
  console.log("Windy API initialized:", windyAPI);
  return windyAPI;
});

// Initial population of the country dropdown and Windy API initialization
console.log("Initializing Windy API and populating country dropdown...");
populateCountryDropdown();
// initWindy();

// Add event listener to the country dropdown options
console.log("Adding event listeners to country dropdown options...");
addEventListenersToOptions();
