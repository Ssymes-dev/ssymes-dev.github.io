// create and initialize leaflet map object
const map = L.map("map").setView([51.505, -0.09], 2);
// Function to fetch country data from travel advisory api and store it locally\
// Function to fetch country data from travel advisory api and store it locally

// load map tiles
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    'Data <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors, Map tiles &copy;',
  minZoom: 2,
  maxZoom: 18,
}).addTo(map);

async function fetchCountryData() {
  const apiUrl = "https://www.travel-advisory.info/api";
  try {
    const response = await fetch(apiUrl);
    const { data: travelData } = await response.json();
    console.log("Travel Data:", travelData);
    return travelData;
  } catch (error) {
    console.error("Error fetching country data:", error);
    return null;
  }
}

const select = L.countrySelect().addTo(map);

async function compareCountryName(selectedCountry, travelData) {
  for (const [name, value] of Object.entries(travelData)) {
    if (value.name === selectedCountry) {
      console.log("match", value.name);
      return value.name; // Return the matched country name
    }
  }
  console.log("no match");
  return null; // Return null when no match is found
}

select.on("change", async function (e) {
  if (e.feature === undefined) {
    // No action when the first item ("Country") is selected
    return;
  }
  const country = L.geoJson(e.feature);
  if (this.previousCountry != null) {
    map.removeLayer(this);
    console.log("removing previous country...");
  }
  this.previousCountry = country;
  map.addLayer(country);
  map.fitBounds(country.getBounds());
  const selectedCountry = e.feature.properties.name;

  // Call compareCountryName function and await the result
  const matchedCountry = await compareCountryName(
    selectedCountry,
    await fetchCountryData()
  );

  // Log the selected and matched country
  console.log("Selected country", selectedCountry);
  console.log("Matched country", matchedCountry);
});

async function onMapClick(e) {
  const clickLat = e.latlng.lat;
  const clickLng = e.latlng.lng;
  console.log([clickLng, clickLat]);
}
map.on("click", onMapClick);

// Helper function to generate popup content
function generateAdvisoryContent(selectedTravelCountryCode) {
  // Retrieve selected country's data from cache
  const selectedCountryData = allTravelData[selectedTravelCountryCode];

  if (selectedCountryData) {
    const advisory = selectedCountryData.advisory;
    updateWeatherText.innerHTML = "Click the map for local weather!";
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
