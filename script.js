const bounds = new L.LatLngBounds([-90, -180], [90, 180]);
const map = L.map("map").setView([51.505, -0.09], 2).setMaxBounds(bounds);
const selectMenu = L.countrySelect().addTo(map);

let currentCountryPolygon = null;

async function initMap() {
  const tileLayerUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  const tileLayerOptions = {
    attribution:
      'Data <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors, Map tiles &copy;',
    minZoom: 2,
    noWrap: true,
  };

  // Create a GeoJSON layer from the countries.geo.json file
  const geojson = await fetch("countries.geo.json")
    .then((response) => response.json())
    .then((data) =>
      L.geoJSON(data, {
        style: function (feature) {
          return {
            opacity: 0,
            color: "white",
          };
        },
      })
    );

  geojson.addTo(map);

  L.tileLayer(tileLayerUrl, tileLayerOptions).addTo(map);

  selectMenu.on("change", async function ({ feature }) {
    if (feature === undefined) {
      // No action when the first item ("Country") is selected
      return;
    }
    const {
      properties: { name },
    } = feature;

    // Remove the current country polygon if it exists
    if (currentCountryPolygon) {
      map.removeLayer(currentCountryPolygon);
    }
    // Create a new country polygon for the selected country
    const country = L.geoJson(feature);
    currentCountryPolygon = country;
    map.addLayer(country);
    map.fitBounds(country.getBounds());

    // Call compareCountryName function and await the result
    await compareCountryName(name, await fetchCountryData());
  });
}

// Call the initMap function to initialize the map

const dropdownOptions = document.getElementsByClassName(
  "leaflet-countryselect"
)[0].options;
async function onMapClick({ latlng: { lat, lng } }) {
  const locationName = await getLocationData(lng, lat);
  setDropdownOptions(locationName, dropdownOptions);
  console.log([lng, lat]);
}

map.on("click", onMapClick);

async function setDropdownOptions(locationName, dropdownOptions) {
  for (let i = 0; i < dropdownOptions.length; i++) {
    const option = dropdownOptions[i];
    if (option.innerText === locationName) {
      dropdownOptions[i].selected = true;

      const event = new Event("change", { bubbles: true });
      dropdownOptions[i].dispatchEvent(event);

      return;
    }
  }
}

async function getLocationData(lng, lat) {
  const OPEN_CAGE_API_KEY = "0c9aade54fba4c8abfae724859a72795";
  const reverseGeocodingApiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${lat},${lng}&key=${OPEN_CAGE_API_KEY}`;

  const response = await fetch(reverseGeocodingApiUrl);
  const { results } = await response.json();
  let locationName = results[0].components.country;
  if (!locationName) {
    locationName = results[0].formatted;
  }
  // console.log("location Name", locationName);
  return locationName;
}

async function fetchCountryData() {
  const apiUrl = "https://www.travel-advisory.info/api";
  try {
    const response = await fetch(apiUrl);
    const { data: travelData } = await response.json();
    console.log("travelData", travelData);
    return travelData;
  } catch (error) {
    console.error("Error fetching country data:", error);
    return null;
  }
}

async function compareCountryName(selectedCountry, travelData) {
  for (const [name, value] of Object.entries(travelData)) {
    const advisoryContent = await generateAdvisoryContent(
      value,
      selectedCountry
    );

    if (advisoryContent) {
      return advisoryContent;
    }
  }

  return null;
}

async function generateAdvisoryContent(countryData, selectedCountry) {
  if (countryData) {
    const { name, advisory } = countryData;
    if (name === selectedCountry) {
      const previousModal = document.getElementById("advisoryModal");
      if (previousModal) {
        previousModal.remove();
      }

      let modalContent = `
        <div class="modal fade" id="advisoryModal" tabindex="-1" role="dialog" aria-labelledby="advisoryModalLabel" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="advisoryModalLabel">${name}</h5>
                <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <p class="advisory-message">Advisory: ${advisory.message}</p>
                <a href="${advisory.source}" target="_blank" rel="noopener noreferrer">Source: ${advisory.sources_active}</a>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML("beforeend", modalContent);
      $("#advisoryModal").modal("show");
    }
  }
}
const modal = document.getElementById("welcomeModal");
const closeModalBtn = document.getElementById("closeModal");
window.onload = function () {
  modal.style.display = "block";
};

closeModalBtn.onclick = function () {
  modal.style.display = "none";
};
initMap();
