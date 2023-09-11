// create and initialize leaflet map object
const map = L.map("map").setView([51.505, -0.09], 2);
// Function to fetch country data from travel advisory api and store it locally\
// Function to fetch country data from travel advisory api and store it locally
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
fetchCountryData();
// load map tiles
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    'Data <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors, Map tiles &copy;',
  minZoom: 2,
  maxZoom: 18,
}).addTo(map);

const select = L.countrySelect().addTo(map);

select.on("change", function (e) {
  if (e.feature === undefined) {
    //No action when the first item ("Country") is selected
    return;
  }
  const country = L.geoJson(e.feature);
  if (this.previousCountry != null) {
    map.removeLayer(this.previousCountry);
    console.log("removing prevous country...");
  }
  this.previousCountry = country;
  map.addLayer(country);
  map.fitBounds(country.getBounds());
  countryName = e.feature.properties.name;
  compareCountryName();
  // consolelog properties.name
  console.log("Selected country", countryName);
  return countryName;
});
// compare country name to country name in travel advisory api
// if country name matches, console.log "match"
// if country name does not match, console.log "no match"
async function compareCountryName(countryName, country, travelData) {
  const countryData = await fetchCountryData();
  const selectedName = select.options[select.selectedIndex];
  console.log("selected name", selectedName);
  for (country in travelData) {
    if (selectedName === countryData[country].name) {
      console.log("match", countryName, country);
    } else {
      console.log("no match");
    }
  }
}

async function onMapClick(e) {
  const clickLat = e.latlng.lat;
  const clickLng = e.latlng.lng;
  console.log("click lat", clickLat);
  console.log("click lng", clickLng);
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
