const countryDropdown = document.getElementById("allCountries");
let map;

const extraSmallCountries = [];
const smallCountries = [];
const mediumCountries = [];
const largeCountries = [];

function populateCountryDropdown() {
  const apiUrl = "https://www.travel-advisory.info/api";
  fetch(apiUrl)
    .then((response) => response.json())
    .then(({ data }) => {
      for (const countryCode in data) {
        const countryName = data[countryCode].name;
        const optionElement = document.createElement("option");
        optionElement.value = countryCode;
        optionElement.textContent = countryName;
        countryDropdown.appendChild(optionElement);
      }
    });
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

function calculateArea(northEast, southWest) {
  const latDiff = Math.abs(northEast.lat - southWest.lat);
  const lngDiff = Math.abs(northEast.lng - southWest.lng);
  const area = (latDiff * lngDiff * 40008000) / 360;

  return area;
}

function setMapLocation(lat, lon, popupContent, bounds, countryCode) {
  windyInit(initWindyOptions, (windyAPI) => {
    const map = windyAPI.map;

    if (bounds && bounds.northeast && bounds.southwest) {
      const area = calculateArea(bounds.northeast, bounds.southwest);
      const countrySize = getCountrySize(area);

      const zoomLevel = getZoomLevel(countryCode, countrySize);

      map.setView([lat, lon], zoomLevel);
    }

    addMarker(map, lat, lon, popupContent);
  });
}

function getCountrySize(area) {
  if (area < 500000) {
    return "extra-small";
  } else if (area <= 50000000) {
    return "small";
  } else if (area <= 500000000) {
    return "medium";
  } else {
    return "large";
  }
}

function getZoomLevel(countryCode, countrySize) {
  switch (countryCode) {
    case "AG":
      return 5; // Medium zoom level for AG
    default:
      switch (countrySize) {
        case "large":
          return 3;
        case "medium":
          return 5;
        case "small":
          return 7;
        case "extra-small":
          return 11;
        default:
          return 10; // Default zoom level
      }
  }
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

countryDropdown.addEventListener("change", async () => {
  const countryCode = countryDropdown.value;
  if (countryCode !== "") {
    const countryData = await fetchCountryData(countryCode);
    const countryListElement = document.getElementById("country-list");
    countryListElement.innerHTML = "";
    displayCountryName(countryData, countryListElement);

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
});

populateCountryDropdown();
