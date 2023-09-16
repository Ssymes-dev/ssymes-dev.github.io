const map = L.map("map").setView([51.505, -0.09], 2);
const select = L.countrySelect().addTo(map);

let currentCountryLayer = null;

// load map tiles
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    'Data <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors, Map tiles &copy;',
  minZoom: 1,
  worldCopyJump: true,
}).addTo(map);

/// eventlistener for menu
select.on("change", async function (e) {
  if (e.feature === undefined) {
    // No action when the first item ("Country") is selected
    return;
  }
  const selectedCountry = e.feature.properties.name;

  // Remove the current country layer if it exists
  if (currentCountryLayer) {
    map.removeLayer(currentCountryLayer);
    console.log("removing previous country...");
  }
  // Create a new country layer for the selected country
  const country = L.geoJson(e.feature);
  currentCountryLayer = country;
  map.addLayer(country);
  map.fitBounds(country.getBounds());

  // Call compareCountryName function and await the result
  await compareCountryName(selectedCountry, await fetchCountryData());

  console.log("Selected country", selectedCountry);
});

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

async function compareCountryName(selectedCountry, travelData) {
  for (const [name, value] of Object.entries(travelData)) {
    const advisoryContent = await generateAdvisoryContent(
      value,
      selectedCountry
    );

    if (advisoryContent) {
      return advisoryContent; // Return the matched country name
    }
  }
  return null; // Return null when no match is found
}

async function generateAdvisoryContent(countryData, selectedCountry) {
  if (countryData) {
    const { name, advisory } = countryData;

    if (name === selectedCountry) {
      // Remove the previous modal content if it exists
      const previousModal = document.getElementById("advisoryModal");
      if (previousModal) {
        previousModal.remove();
      }

      const modalContent = `
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

async function onMapClick(e) {
  const clickLat = e.latlng.lat;
  const clickLng = e.latlng.lng;
  console.log([clickLng, clickLat]);
}
map.on("click", onMapClick);

// modal
// Get references to the modal and close button
const modal = document.getElementById("myModal");
const closeModalBtn = document.getElementById("closeModal");

// Show the modal when the page is loaded
window.onload = function () {
  modal.style.display = "block";
};

// Close the modal when the close button is clicked
closeModalBtn.onclick = function () {
  modal.style.display = "none";
};
