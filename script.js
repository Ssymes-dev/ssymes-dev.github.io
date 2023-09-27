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

const dropdownOptions = document.getElementsByClassName("search")[0].options;
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
  if (!locationName) {
    locationName = results[0].formatted;
  }
  console.log("location Name", locationName);
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

initMap();

// // Event listener for the country dropdown options
// countryDropdown.parentElement.addEventListener("click", async (event) => {
//   if (event.target.classList.contains("dropdown-item")) {
//     selectedTravelCountryCode = event.target.getAttribute("dropdown-options");
//     if (selectedTravelCountryCode) {
//       // Set the search input value and selected code attribute
//       search.value = event.target.textContent;
//       console.log("Set search input value:", search.value);
//       search.setAttribute("menu-selected-option", selectedTravelCountryCode);
//       search.value = ""; // Reset search input value

//       // Find the selected option based on the country code
//       const selectedOption = countryArray.find(
//         (option) => option.code === selectedTravelCountryCode
//       );

//       if (selectedOption) {
//         // Update dropdown value, fetch and display country details, update map
//         countryDropdown.value = selectedOption.code;
//         await getAllTravelData(selectedOption.code);

//         // Check for the special case of "Georgia"
//         if (selectedTravelCountryCode === "GE") {
//           // Hard-code the lat and lng for Georgia (the country)
//           const georgiaLat = 42.3154;
//           const georgiaLng = 43.3569;
//           const zoomLevel = getZoomLevel(selectedTravelCountryCode);

//           setMapLocation(
//             georgiaLat,
//             georgiaLng,
//             generatePopupContent(selectedTravelCountryCode),
//             zoomLevel
//           );
//         } else {
//           // Call getLatLng to get lat and lng
//           const { lat, lng } = await getLatLng(selectedTravelCountryCode);
//           // Get the zoom level for the selected country
//           const zoomLevel = getZoomLevel(selectedTravelCountryCode);
//           // Pass lat, lng, and zoom level to setMapLocation
//           setMapLocation(
//             lat,
//             lng,
//             generatePopupContent(selectedTravelCountryCode),
//             zoomLevel
//           );
//         }
//       }
//     }
//   }
// });

// search filter????
// const search = document.getElementById("search");
// const countryDropdown = document.getElementById("countryDropdown");
// let countryArray = [];

// // Event listener for the search input (typing)
// search.addEventListener("input", async () => {
//   const searchTerm = search.value.trim().toLowerCase();
//   // Filter options based on the search term
//   const filteredOptions = countryArray.filter(
//     (option) =>
//       option.name.toLowerCase().includes(searchTerm) ||
//       option.code.toLowerCase().includes(searchTerm)
//   );
//   appendDropdownOptions(filteredOptions);
//   console.log("Filtered options based on search:", filteredOptions);
// });

// // Event listener for clicking the the search input
// search.addEventListener("click", async () => {
//   // If the search input is empty, populate the country dropdown
//   if (search.value.trim() === "") {
//     //.trim ignores spaces
//     console.log("Populating country dropdown...");
//     appendDropdownOptions(countryArray);
//   }
//   console.log("Populated country dropdown");
// });
// // Function to populate the country dropdown
// async function populateCountryDropdown() {
//   try {
//     const travelData = await fetchCountryData();
//     countryArray = alphabetizeCountries(travelData);
//     console.log("Populated countryArray with travel data:", countryArray);
//   } catch (error) {
//     console.error("Error fetching country data:", error);
//   }
// }

// // Function to append dropdown options
// function appendDropdownOptions(travelData) {
//   countryDropdown.innerHTML = "";
//   const placeholderOption = document.createElement("li");
//   placeholderOption.innerHTML =
//     '<a class="dropdown-item disabled" href="#" dropdown-options="">Select a Country...</a>';
//   countryDropdown.appendChild(placeholderOption);

//   for (const option of travelData) {
//     const optionElement = document.createElement("li");
//     optionElement.innerHTML = `<a class="dropdown-item" href="#" dropdown-options="${option.code}">${option.name}</a>`;
//     countryDropdown.appendChild(optionElement);
//   }
//   // Log the updated countryArray array
//   console.log("Updated countryArray:", countryArray);
// }
// // Helper function to alphabetize country options
// function alphabetizeCountries(travelData) {
//   // Create an array of country options with code and name properties
//   const countryOptions = Object.keys(travelData).map(
//     (selectedTravelCountryCode) => ({
//       code: selectedTravelCountryCode,
//       name: travelData[selectedTravelCountryCode].name,
//     })
//   );

//   // Sort country options alphabetically by name
//   return countryOptions.sort((a, b) => a.name.localeCompare(b.name));
// }
