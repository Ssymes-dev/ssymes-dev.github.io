// Global variables
const countryDropdown = document.getElementById("allCountries");
const countrySearchInput = document.getElementById("countrySearchInput");
let allCountryOptions = []; // To store the list of all country options
let countryDataCache = null; // To cache fetched country data
let windyAPI; // Windy API object for map interaction

// Initialization
const initWindyOptions = {
  key: "9N1YXUo4GoPgLBOjB85IYsz5CwIUgzce",
  verbose: false,
  lat: 50.4,
  lon: 14.3,
  zoom: 0,
};

// Initialize Windy API with provided options
console.log("Initializing Windy API...");
windyInit(initWindyOptions, (api) => {
  windyAPI = api; // Store the initialized API object in the global variable
  console.log("Windy API initialized:", windyAPI);
});

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
      event.target.getAttribute("data-country-code");
    if (selectedTravelCountryCode) {
      // Set the search input value and selected code attribute
      countrySearchInput.value = event.target.textContent;
      console.log("Set search input value:", countrySearchInput.value);
      countrySearchInput.setAttribute(
        "data-selected-code",
        selectedTravelCountryCode
      );
      countrySearchInput.value = ""; // Reset search input value

      // Find the selected option based on the country code
      const selectedOption = allCountryOptions.find(
        ({ code }) => code === selectedTravelCountryCode
      );

      if (selectedOption) {
        // Update dropdown value, fetch and display country details, update map
        countryDropdown.value = selectedOption.code;
        const travelData = await getCachedCountryData(selectedOption.code);
        displayCountryDetails(travelData);
        await updateMapWithGeocoding(selectedOption.code);
      }
    }
  }
});

// Event listener for the search input
countrySearchInput.addEventListener("input", async () => {
  const searchTerm = countrySearchInput.value.trim().toLowerCase();
  // Filter options based on the search term
  const filteredOptions = allCountryOptions.filter(
    (option) =>
      option.name.toLowerCase().includes(searchTerm) ||
      option.code.toLowerCase().includes(searchTerm)
  );
  appendDropdownOptions(filteredOptions);
  console.log("Filtered options based on search:", filteredOptions);
});

// Event listener for the search input click
countrySearchInput.addEventListener("click", async () => {
  filteredOptions = [];
  console.log("Cleared filteredOptions array");

  // If the search input is empty, populate the country dropdown
  if (countrySearchInput.value.trim() === "") {
    console.log("Populating country dropdown...");
    appendDropdownOptions(allCountryOptions); //await populateCountryDropdown(); was causing the menu to load previous search after second click
  }
  console.log("Populated country dropdown");
});

// Function to fetch country data
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
    allCountryOptions = alphabetizeCountries(travelData);
    appendDropdownOptions(allCountryOptions);
    console.log(
      "Populated allCountryOptions with travel data:",
      allCountryOptions
    );
  } catch (error) {
    console.error("Error fetching country data:", error);
  }
}

// Function to append dropdown options
function appendDropdownOptions(travelData) {
  countryDropdown.innerHTML = "";
  const placeholderOption = document.createElement("li");
  placeholderOption.innerHTML =
    '<a class="dropdown-item disabled" href="#" data-country-code="">Type to filter...</a>';
  countryDropdown.appendChild(placeholderOption);

  for (const option of travelData) {
    const optionElement = document.createElement("li");
    optionElement.innerHTML = `<a class="dropdown-item" href="#" data-country-code="${option.code}">${option.name}</a>`;
    countryDropdown.appendChild(optionElement);
  }
  // Log the updated allCountryOptions array
  console.log("Updated allCountryOptions:", allCountryOptions);
}

// Function to get country data from the cache
async function getCachedCountryData(travelCountryCode) {
  if (countryDataCache !== null) {
    return countryDataCache[travelCountryCode];
  }

  try {
    const travelData = await fetchCountryData();
    countryDataCache = travelData;
    console.log("Cached country data in countryDataCache:", countryDataCache);
    return countryDataCache[travelCountryCode];
  } catch (error) {
    console.error("Error fetching country data:", error);
    throw error;
  }
}

// Function to set map location and add a marker with popup
function setMapLocation(lat, lon, popupContent, bounds) {
  // Check if the Windy API is initialized
  if (!windyAPI) {
    console.error("Windy API not initialized!");
    return;
  }

  // Get the Windy map instance
  const map = windyAPI.map;

  // Check if bounds information is provided
  if (bounds && bounds.northeast && bounds.southwest) {
    // Extract coordinates from bounds information
    const southWestLatLng = L.latLng(
      bounds.southwest.lat,
      bounds.southwest.lng
    );
    const northEastLatLng = L.latLng(
      bounds.northeast.lat,
      bounds.northeast.lng
    );

    // Create a bounding box using the extracted coordinates
    const boundingBox = L.latLngBounds(southWestLatLng, northEastLatLng);

    // Fit the map to the bounding box
    map.fitBounds(boundingBox);

    // Call the addMarker function to add a marker with popup
    addMarker(map, lat, lon, popupContent);
  } else {
    console.error("Bounds information not provided!");
  }
}

// Helper function to add a marker with a popup, removing existing marker if it exists
function addMarker(map, lat, lon, popupContent) {
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
  const marker = L.marker([lat, lon]).addTo(map);

  // Create a popup for the marker
  const popup = L.popup().setContent(popupContent);

  // Bind the popup to the marker and open it
  marker.bindPopup(popup).openPopup();
}

// Function to add event listeners to dropdown options
function addEventListenersToOptions() {
  const dropdownOptions = document.querySelectorAll(".dropdown-item");
  dropdownOptions.forEach((option) => {
    // Add a click event listener to each dropdown option
    option.addEventListener("click", async () => {
      const selectedTravelCountryCode =
        option.getAttribute("data-country-code");

      // Check if a country code is available
      if (selectedTravelCountryCode) {
        countrySearchInput.value = option.textContent;
        countrySearchInput.setAttribute(
          "data-selected-code",
          selectedTravelCountryCode
        );

        // Find the selected country option
        const selectedOption = allCountryOptions.find(
          ({ code }) => code === selectedTravelCountryCode
        );

        // Display country details and update the map
        if (selectedOption) {
          countryDropdown.value = selectedOption.code;
          const travelData = await getCachedCountryData(selectedOption.code);
          displayCountryDetails(travelData);

          // Log the selected country's details
          console.log("Selected Country Details:", travelData);
        }
      }
    });
  });
}

// Helper function to generate popup content
function generatePopupContent(travelCountryCode) {
  // Check if country data cache is available
  if (!countryDataCache) {
    return "";
  }

  // Retrieve selected country's data from cache
  const selectedCountryData = countryDataCache[travelCountryCode];
  if (selectedCountryData) {
    const advisory = selectedCountryData.advisory;

    // Handle sources_active as an array or single source
    const sourcesActive = Array.isArray(advisory.sources_active)
      ? advisory.sources_active
      : [advisory.sources_active];

    // Construct popup content
    const popupContent = `
        <h5>${selectedCountryData.name}</h5>
        <p class="advisory-message">Advisory: ${advisory.message}</p>

        <a href="${
          advisory.source
        }" target="_blank" rel="noopener noreferrer">Sources: ${createSourcesText(
      sourcesActive
    )}</a>
    `;

    // Log the generated popup content
    console.log("Popup Content:", popupContent);

    return popupContent;
  } else {
    return "";
  }
}

// Function to create sources text
function createSourcesText(sources) {
  // Combine sources with commas and return
  return sources.join(", ");
}

// Function to update the map with geocoding data
async function updateMapWithGeocoding(travelCountryCode) {
  try {
    const OPEN_CAGE_API_KEY = "0c9aade54fba4c8abfae724859a72795";
    const selectedTravelOption = allCountryOptions.find(
      (option) => option.code === travelCountryCode
    );
    const geocodingApiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${selectedTravelOption.name}&key=${OPEN_CAGE_API_KEY}`;

    // Fetch geocoding data from the API
    const response = await fetch(geocodingApiUrl);
    const { results } = await response.json();

    if (results && results.length > 0) {
      const { lat, lng } = results[0].geometry;
      const bounds = results[0].bounds;

      // Set the map location with the generated popup content
      setMapLocation(lat, lng, generatePopupContent(travelCountryCode), bounds);
    }
  } catch (error) {
    console.error("Error updating map with geocoding:", error);
  }
}

// Function to display country details on the page
async function displayCountryDetails(travelData) {
  const countryListElement = document.getElementById("country-list");
  const travelCountryCode = countryDropdown.value;
  const selectedCountryData = travelData[travelCountryCode];
  if (selectedCountryData) {
    const countryNameElement = document.createElement("p");
    const countryName = document.createElement("h1");
    countryName.textContent = selectedCountryData.name;
    countryNameElement.appendChild(countryName);
    countryListElement.appendChild(countryNameElement);

    if (travelCountryCode !== "") {
      try {
        // Update the map with geocoding data
        await updateMapWithGeocoding(travelCountryCode);
      } catch (error) {
        console.error("Error updating map with geocoding:", error);
      }
    }
  }
}

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
function initWindy() {
  windyInit(initWindyOptions, (api) => {
    windyAPI = api; // Store the initialized API object in the global variable
    console.log("Windy API initialized:", windyAPI);
  });
}

// Initial population of the country dropdown and Windy API initialization
console.log("Initializing Windy API and populating country dropdown...");
populateCountryDropdown();
initWindy();

// Add event listener to the country dropdown options
console.log("Adding event listeners to country dropdown options...");
addEventListenersToOptions();
