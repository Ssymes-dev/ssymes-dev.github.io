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

function createSourcesText(numSources) {
  if (numSources === 0) {
    return "No sources available.";
  } else if (numSources === 1) {
    return "1 source available.";
  } else {
    return `${numSources} sources available.`;
  }
}

function createAdvisoryLink(advisory) {
  const advisoryLinkElement = document.createElement("a");
  const numSources = advisory.sources_active;
  let numText;
  if (numSources === 0) {
    numText = "No sources available.";
  } else if (numSources === 1) {
    numText = "1 source available.";
  } else {
    numText = `${numSources} sources available.`;
  }

  const sourceText = document.createTextNode(` ${numText}`);
  advisoryLinkElement.title = ` ${numText}`;
  advisoryLinkElement.appendChild(sourceText);
  advisoryLinkElement.href = advisory.source;

  return advisoryLinkElement;
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
    map = windyAPI.map;

    if (bounds && bounds.northeast && bounds.southwest) {
      const area = calculateArea(bounds.northeast, bounds.southwest);
      let countrySize;
      if (area < 500000) {
        countrySize = "extra-small";
        extraSmallCountries.push(popupContent);
      } else if (area <= 50000000) {
        countrySize = "small";
        smallCountries.push(popupContent);
      } else if (area <= 500000000) {
        countrySize = "medium";
        mediumCountries.push(popupContent);
      } else {
        countrySize = "large";
        largeCountries.push(popupContent);
      }

      const extraSmallZoom = 11;
      const smallZoom = 7;
      const mediumZoom = 5;
      const largeZoom = 3;

      switch (countryCode) {
        case "AG":
          map.setView([lat, lon], mediumZoom);
          break;
        default:
          switch (countrySize) {
            case "large":
              map.setView([lat, lon], largeZoom);
              break;
            case "medium":
              map.setView([lat, lon], mediumZoom);
              break;
            case "small":
              map.setView([lat, lon], smallZoom);
              break;
            case "extra-small":
              map.setView([lat, lon], extraSmallZoom);
              break;
            default:
              map.setView([lat, lon], map.getZoom());
              break;
          }
          break;
      }
    }

    const marker = L.marker([lat, lon]).addTo(map);
    marker.bindPopup(popupContent);
    marker.openPopup();
  });
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
