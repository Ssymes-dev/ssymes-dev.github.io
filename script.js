const bounds = new L.LatLngBounds([-90, -180], [90, 180]);
const map = L.map("map", { zoomControl: false })
  .setView([51.505, -0.09], 2)
  .setMaxBounds(bounds);
L.control.zoom({ position: "topright" }).addTo(map);
const selectMenu = L.countrySelect().addTo(map);
const dropdownOptions = document.getElementsByClassName("search")[0].options;
let currentCountryPolygon = null;

async function initMap() {
  const tileLayerUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  const tileLayerOptions = {
    attribution:
      'Data <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors, Map tiles &copy;',
    minZoom: 3,
    noWrap: true,
  };
  L.tileLayer(tileLayerUrl, tileLayerOptions).addTo(map);
}

// polygon layer for dynamic cursor
const polygonLayer = fetch("countries.geo.json")
  .then((response) => response.json())
  .then((data) =>
    L.geoJSON(data, {
      style: function (feature) {
        return {
          opacity: 0,
          color: "white",
        };
      },
    }).addTo(map)
  );

// eventlistener for dropdown menu
selectMenu.on("change", async function ({ feature }) {
  if (feature === undefined) {
    return;
  }
  const {
    properties: { name },
  } = feature;

  if (currentCountryPolygon) {
    map.removeLayer(currentCountryPolygon);
  }
  const countryPolygon = L.geoJson(feature);
  currentCountryPolygon = countryPolygon;
  map.addLayer(countryPolygon);
  map.fitBounds(countryPolygon.getBounds());

  await compareCountryName(name, await fetchCountryData());
});

async function onMapClick({ latlng: { lat, lng } }) {
  const locationName = await getLocationData(lng, lat);
  setDropdownOptions(locationName, dropdownOptions);
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

  return locationName;
}

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

initMap();
