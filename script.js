// Global variables
const countryDropdown = document.getElementById("allCountries");
const countrySearchInput = document.getElementById("countrySearchInput");
let allCountryOptions = [];
let countryDataCache = null;
let windyAPI;

// Initialization
const initWindyOptions = {
  key: "9N1YXUo4GoPgLBOjB85IYsz5CwIUgzce",
  verbose: false,
  lat: 50.4,
  lon: 14.3,
  zoom: 0,
};

windyInit(initWindyOptions);

$(document).ready(function () {
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
      countrySearchInput.value = event.target.textContent;
      countrySearchInput.setAttribute(
        "data-selected-code",
        selectedTravelCountryCode
      );
      countrySearchInput.value = "";

      const selectedOption = allCountryOptions.find(
        ({ code }) => code === selectedTravelCountryCode
      );
      if (selectedOption) {
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
});

// Event listener for the search input click
countrySearchInput.addEventListener("click", async () => {
  allCountryOptions.length = 0;
  // If the search input is empty, populate the country dropdown
  if (countrySearchInput.value.trim() === "") {
    await populateCountryDropdown();
  }
});

function googleTranslateElementInit() {
  new google.translate.TranslateElement(
    {
      pageLanguage: "en",
      layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
    },
    "google_translate_element"
  );
}

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
    return countryDataCache[travelCountryCode];
  } catch (error) {
    console.error("Error fetching country data:", error);
    throw error;
  }
}

// Function to set map location and add a marker with popup
function setMapLocation(lat, lon, popupContent, bounds) {
  if (!windyAPI) {
    console.error("Windy API not initialized!");
    return;
  }

  const map = windyAPI.map;

  if (bounds && bounds.northeast && bounds.southwest) {
    const southWestLatLng = L.latLng(
      bounds.southwest.lat,
      bounds.southwest.lng
    );
    const northEastLatLng = L.latLng(
      bounds.northeast.lat,
      bounds.northeast.lng
    );
    const boundingBox = L.latLngBounds(southWestLatLng, northEastLatLng);

    map.fitBounds(boundingBox);

    addMarker(map, lat, lon, popupContent);
  }
}

// Helper function to add a marker with a popup, removing existing marker if it exists
function addMarker(map, lat, lon, popupContent) {
  if (!map) {
    console.error("Map not provided!");
    return;
  }

  // Check if a marker already exists on the map
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      layer.remove();
    }
  });

  const marker = L.marker([lat, lon]).addTo(map);
  const popup = L.popup({
    maxWidth: 275,
    maxHeight: 275,
  }).setContent(popupContent);

  marker.bindPopup(popup).openPopup();
}

// Function to add event listeners to dropdown options
function addEventListenersToOptions() {
  const dropdownOptions = document.querySelectorAll(".dropdown-item");
  dropdownOptions.forEach((option) => {
    option.addEventListener("click", async () => {
      const selectedTravelCountryCode =
        option.getAttribute("data-country-code");
      if (selectedTravelCountryCode) {
        countrySearchInput.value = option.textContent;
        countrySearchInput.setAttribute(
          "data-selected-code",
          selectedTravelCountryCode
        );

        const selectedOption = allCountryOptions.find(
          ({ code }) => code === selectedTravelCountryCode
        );
        if (selectedOption) {
          countryDropdown.value = selectedOption.code;
          const travelData = await getCachedCountryData(selectedOption.code);
          displayCountryDetails(travelData);
        }
      }
    });
  });
}

// Helper function to generate popup content
function generatePopupContent(travelCountryCode) {
  if (!countryDataCache) {
    return "";
  }

  const selectedCountryData = countryDataCache[travelCountryCode];
  if (selectedCountryData) {
    const advisory = selectedCountryData.advisory;

    const sourcesActive = Array.isArray(advisory.sources_active)
      ? advisory.sources_active
      : [advisory.sources_active];

    const popupContent = `
      <div class="leaflet-popup-content" id="popupContent">
        <h3>${selectedCountryData.name}</h3>
        <p class="advisory-message">Advisory: ${advisory.message}</p>

        <a href="${
          advisory.source
        }" target="_blank" rel="noopener noreferrer">Sources: ${createSourcesText(
      sourcesActive
    )}</a>
      </div>
    `;

    console.log("Popup Content:", popupContent);

    return popupContent;
  } else {
    return "";
  }
}

// Function to create sources text
function createSourcesText(sources) {
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

// Function to display country details
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
        await updateMapWithGeocoding(travelCountryCode);
      } catch (error) {
        console.error("Error updating map with geocoding:", error);
      }
    }
  }
}
// Helper function to alphabetize country options
function alphabetizeCountries(travelData) {
  const countryOptions = Object.keys(travelData).map((travelCountryCode) => ({
    code: travelCountryCode,
    name: travelData[travelCountryCode].name,
  }));
  return countryOptions.sort((a, b) => a.name.localeCompare(b.name));
}

function initWindy() {
  windyInit(initWindyOptions, (api) => {
    windyAPI = api; // Store the initialized API object in the global variable
  });
}

// Initial population of the country dropdown and Windy API initialization
populateCountryDropdown();

initWindy();

// Add event listener to the country dropdown options
addEventListenersToOptions();
