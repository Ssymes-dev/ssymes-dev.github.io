// Global variables
const countryDropdown = document.getElementById("allCountries");
const countrySearchInput = document.getElementById("countrySearchInput");
let allCountryOptions = [];
let countryDataCache = null;
let windyAPI;

// Initialization
const initWindyOptions = {
  key: "9N1YXUo4GoPgLBOjB85IYsz5CwIUgzce",
  verbose: true,
  lat: 50.4,
  lon: 14.3,
  zoom: 0,
};

windyInit(initWindyOptions);

// Event listener for the country dropdown options
countryDropdown.parentElement.addEventListener("click", async (event) => {
  if (event.target.classList.contains("dropdown-item")) {
    const selectedCountryName = event.target.textContent;
    const selectedCountryCode = event.target.getAttribute("data-country-code");
    countrySearchInput.value = selectedCountryName;
    countrySearchInput.setAttribute("data-selected-code", selectedCountryCode);

    const selectedOption = allCountryOptions.find(
      (option) => option.code === selectedCountryCode
    );
    if (selectedOption) {
      countryDropdown.value = selectedOption.code;
      const countryData = await getCachedCountryData(selectedOption.code);
      displayCountryDetails(countryData[0]); // Use countryData[0] to access the first item
    }
  }
});

// Event listener for the search input
countrySearchInput.addEventListener("input", async () => {
  const searchTerm = countrySearchInput.value.trim().toLowerCase();
  const filteredOptions = allCountryOptions.filter(
    (option) =>
      option.name.toLowerCase().includes(searchTerm) ||
      option.code.toLowerCase().includes(searchTerm)
  );

  appendDropdownOptions(filteredOptions);

  // If there's only one matching option, automatically select it and update the country list
  if (filteredOptions.length === 1) {
    const selectedCountryData = filteredOptions[0];
    countryDropdown.value = selectedCountryData.code;
    const countryData = await getCachedCountryData(selectedCountryData.code);
    updateCountryList(countryData);
  }
});
// Function to fetch country data
async function fetchCountryData() {
  const apiUrl = "https://www.travel-advisory.info/api";
  try {
    const response = await fetch(apiUrl);
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching country data:", error);
    return null;
  }
}

// Helper function to create an advisory link
function createAdvisoryLink(advisory) {
  const advisoryLinkElement = document.createElement("a");
  const numSources = advisory.sources_active;
  const numText = createSourcesText(numSources);

  const sourceText = document.createTextNode(` ${numText}`);
  advisoryLinkElement.title = ` ${numText}`;
  advisoryLinkElement.appendChild(sourceText);
  advisoryLinkElement.href = advisory.source;

  return advisoryLinkElement;
}

// Helper function to create text based on the number of sources
function createSourcesText(numSources) {
  if (numSources === 0) {
    return "No sources available.";
  } else if (numSources === 1) {
    return "1 source available.";
  } else {
    return `${numSources} sources available.`;
  }
}

// Helper function to generate popup content
function generatePopupContent(countryData, countryCode) {
  if (!countryData || !countryData[countryCode]) {
    return "<h1>No advisory information available.</h1>";
  }

  const advisory = countryData[countryCode].advisory;
  const advisoryLink = createAdvisoryLink(advisory);

  const countryName = countryData[countryCode].name;
  const advisoryMessage = advisory.message;
  const sourcesHTML = advisoryLink.outerHTML;

  const popupContent = `
    <h1>${countryName}</h1>
    <p>${advisoryMessage}</p>
    <p>Sources: ${sourcesHTML}</p>
  `;

  return popupContent;
}

// Function to populate the country dropdown
async function populateCountryDropdown() {
  try {
    const data = await fetchCountryData();
    const sortedCountryOptions = sortCountryOptions(data);
    allCountryOptions = sortedCountryOptions;
    appendDropdownOptions(sortedCountryOptions);
    addEventListenersToOptions();
  } catch (error) {
    console.error("Error fetching country data:", error);
  }
}

// Function to append dropdown options
function appendDropdownOptions(countryOptions) {
  countryDropdown.innerHTML = "";
  const placeholderOption = document.createElement("li");
  placeholderOption.innerHTML =
    '<a class="dropdown-item" href="#" data-country-code="">Type to filter...</a>';
  countryDropdown.appendChild(placeholderOption);

  for (const option of countryOptions) {
    const optionElement = document.createElement("li");
    optionElement.innerHTML = `<a class="dropdown-item" href="#" data-country-code="${option.code}">${option.name}</a>`;
    countryDropdown.appendChild(optionElement);
  }
}

// Function to get country data from the cache
async function getCachedCountryData(countryCode) {
  if (countryDataCache !== null) {
    return countryDataCache[countryCode];
  }

  try {
    const data = await fetchCountryData();
    countryDataCache = data;
    return countryDataCache[countryCode];
  } catch (error) {
    console.error("Error fetching country data:", error);
    throw error;
  }
}

// Function to display country details
async function displayCountryDetails(countryData) {
  const countryListElement = document.getElementById("country-list");
  const countryCode = countryDropdown.value;

  clearCountryList(countryListElement);

  for (const code in countryData) {
    const countryNameElement = document.createElement("p");
    const countryName = document.createElement("h1");
    countryName.textContent = countryData[code].name;
    countryNameElement.appendChild(countryName);
    countryListElement.appendChild(countryNameElement);
  }

  if (countryCode !== "") {
    try {
      await updateMapWithGeocoding(countryData, countryCode);
    } catch (error) {
      console.error("Error updating map with geocoding:", error);
    }
  }
}

// Helper function to sort country options
function sortCountryOptions(data) {
  const countryOptions = Object.keys(data).map((countryCode) => ({
    code: countryCode,
    name: data[countryCode].name,
  }));
  return countryOptions.sort((a, b) => a.name.localeCompare(b.name));
}

// Helper function to clear the country list element
function clearCountryList(countryListElement) {
  countryListElement.innerHTML = "";
}

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

// Helper function to add a marker with a popup
function addMarker(map, lat, lon, popupContent) {
  const marker = L.marker([lat, lon]).addTo(map);
  marker.bindPopup(popupContent);
  marker.openPopup();
}

// Function to add event listeners to dropdown options
function addEventListenersToOptions() {
  const dropdownOptions = document.querySelectorAll(".dropdown-item");
  dropdownOptions.forEach((option) => {
    option.addEventListener("click", async () => {
      const selectedCountryName = option.textContent;
      const selectedCountryCode = option.getAttribute("data-country-code");
      countrySearchInput.value = selectedCountryName;
      countrySearchInput.setAttribute(
        "data-selected-code",
        selectedCountryCode
      );

      const selectedOption = allCountryOptions.find(
        (countryOption) => countryOption.code === selectedCountryCode
      );
      if (selectedOption) {
        countryDropdown.value = selectedOption.code;
        const countryData = await getCachedCountryData(selectedOption.code);
        displayCountryDetails(countryData[0]); // Use countryData[0] to access the first item
      }
    });
  });
}

// Function to update the map with geocoding data
async function updateMapWithGeocoding(countryData, countryCode) {
  try {
    const OPEN_CAGE_API_KEY = "0c9aade54fba4c8abfae724859a72795";
    const selectedCountryData = allCountryOptions.find(
      (option) => option.code === countryCode
    );
    const geocodingApiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${selectedCountryData.name}&key=${OPEN_CAGE_API_KEY}`;

    const response = await fetch(geocodingApiUrl);
    const { results } = await response.json();

    if (results && results.length > 0) {
      const { lat, lng } = results[0].geometry;
      const bounds = results[0].bounds;
      const popupContent = generatePopupContent(
        countryData,
        selectedCountryData.code
      );
      setMapLocation(lat, lng, popupContent, bounds);
    }
  } catch (error) {
    console.error("Error updating map with geocoding:", error);
  }
}

// Initial population of the country dropdown and Windy API initialization
populateCountryDropdown();

function initWindy() {
  windyInit(initWindyOptions, (api) => {
    windyAPI = api; // Store the initialized API object in the global variable
  });
}

initWindy();
