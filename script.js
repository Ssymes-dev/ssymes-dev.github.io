const countryDropdown = document.getElementById("allCountries");
let map;

function populateCountryDropdown() {
  const apiUrl = "https://www.travel-advisory.info/api";
  fetch(apiUrl)
    .then((response) => response.json())
    .then(({ data }) => {
      const sortedCountryOptions = SortCountryOptions(data);
      appendDropdownOptions(sortedCountryOptions);
    });
}
function SortCountryOptions(data) {
  const countryOptions = Object.keys(data).map((countryCode) => ({
    code: countryCode,
    name: data[countryCode].name,
  }));
  return countryOptions.sort((a, b) => a.name.localeCompare(b.name));
}

function appendDropdownOptions(countryOptions) {
  for (const countryOption of countryOptions) {
    const optionElement = document.createElement("option");
    optionElement.value = countryOption.code;
    optionElement.textContent = countryOption.name;
    countryDropdown.appendChild(optionElement);
  }
}

async function fetchCountryData(countryCode) {
  const apiUrl = `https://www.travel-advisory.info/api?countrycode=${countryCode}`;
  const response = await fetch(apiUrl);
  const result = await response.json();
  const countryData = result.data;
  console.log(countryData);
  return countryData;
}

function displayCountryName(countryData, countryListElement) {
  for (const countryCode in countryData) {
    const countryNameElement = document.createElement("p");
    const countryName = document.createElement("h1");
    countryName.textContent = countryData[countryCode].name;
    countryNameElement.appendChild(countryName);
    countryListElement.appendChild(countryNameElement);
  }
}

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

function createSourcesText(numSources) {
  if (numSources === 0) {
    return "No sources available.";
  } else if (numSources === 1) {
    return "1 source available.";
  } else {
    return `${numSources} sources available.`;
  }
}
function generatePopupContent(countryData, countryCode) {
  const advisory = countryData[countryCode].advisory;
  const advisoryLink = createAdvisoryLink(advisory);

  const popupContent = `
    <h1>${countryData[countryCode].name}</h1>
    <p>${advisory.message}</p>
    <p>Sources: ${advisoryLink.outerHTML}</p>
  `;

  return popupContent;
}
function setMapLocation(lat, lon, popupContent, bounds) {
  windyInit(initWindyOptions, (windyAPI) => {
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
  });
}

function addMarker(map, lat, lon, popupContent) {
  const marker = L.marker([lat, lon]).addTo(map);
  marker.bindPopup(popupContent);
  marker.openPopup();
}

const initWindyOptions = {
  key: "9N1YXUo4GoPgLBOjB85IYsz5CwIUgzce",
  verbose: true,
  lat: 50.4,
  lon: 14.3,
  zoom: 0,
};

windyInit(initWindyOptions);

function updateCountryList(countryData) {
  const countryListElement = document.getElementById("country-list");
  countryListElement.innerHTML = "";
  displayCountryName(countryData, countryListElement);

  const countryCode = countryDropdown.value;
  if (countryCode !== "") {
    const OPEN_CAGE_API_KEY = "0c9aade54fba4c8abfae724859a72795";
    const geocodingApiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${countryData[countryCode].name}&key=${OPEN_CAGE_API_KEY}`;
    fetch(geocodingApiUrl)
      .then((response) => response.json())
      .then(({ results }) => {
        if (results && results.length > 0) {
          const { lat, lng } = results[0].geometry;
          const bounds = results[0].bounds;
          const popupContent = generatePopupContent(countryData, countryCode);
          setMapLocation(lat, lng, popupContent, bounds, countryCode);
        }
      });
  }
}

countryDropdown.addEventListener("change", async () => {
  const countryCode = countryDropdown.value;
  if (countryCode !== "") {
    const countryData = await fetchCountryData(countryCode);
    updateCountryList(countryData);
  }
});

populateCountryDropdown();
