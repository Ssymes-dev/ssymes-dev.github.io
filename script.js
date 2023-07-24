const dropdownMenu = document.getElementById("allCountries");
const submitButton = document.querySelector(".btn");

submitButton.onclick = async (e) => {
  e.preventDefault();
  const countryCode = dropdownMenu.value;
  const data = await apiObject(countryCode);
  dropdownMenu.selectedIndex = -1;
  console.log(countryCode);

  const countryList = document.getElementById("country-list");
  countryList.innerHTML = "";
  getCountryText(data, countryList);
  const advisoryObject = getLink(data[countryCode].advisory);
  countryList.appendChild(advisoryObject);

  // Fetch latitude and longitude from OpenCage Geocoding API
  const OPEN_CAGE_API_KEY = "0c9aade54fba4c8abfae724859a72795";
  const geocodingApiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${data[countryCode].name}&key=${OPEN_CAGE_API_KEY}`;
  fetch(geocodingApiUrl)
    .then((response) => response.json())
    .then(({ results }) => {
      if (results && results.length > 0) {
        const { lat, lng } = results[0].geometry;
        const content = `${data[countryCode].advisory.message}<br>Sources: ${data[countryCode].advisory.sources_active} ${advisoryObject.textContent}`;
        setMapLocation(lat, lng, content, advisoryObject);
      } else {
        console.error("Geocoding API response is empty or invalid.");
      }
    })
    .catch((error) => {
      console.error("Error fetching geocoding data:", error);
    });
};

// Function to populate dropdown menu
function getCountriesFromApi() {
  const apiUrl = "https://www.travel-advisory.info/api";
  fetch(apiUrl)
    .then((response) => response.json())
    .then(({ data }) => {
      for (const list in data) {
        const countryName = data[list].name;
        const choice = document.createElement("option");
        choice.value = list;
        choice.textContent = countryName;
        dropdownMenu.appendChild(choice);
      }
    });
}

// Function to fetch country data and set map location
async function apiObject(countryCode) {
  const apiUrl = `https://www.travel-advisory.info/api?countrycode=${countryCode}`;
  const response = await fetch(apiUrl);
  const result = await response.json();
  const data = result.data;
  console.log(data);
  return data;
}

// Function to create country name text
function getCountryText(data, countryList) {
  for (const country in data) {
    const countryElement = document.createElement("p");

    // Create countryName title
    const countryName = document.createElement("h1");
    countryName.textContent = data[country].name;
    countryElement.appendChild(countryName);
    countryList.appendChild(countryElement);
  }
}

// Function to create the source link
function getLink(advisory) {
  const numberText = document.createElement("a");
  const numSources = advisory.sources_active;
  let numText;
  if (numSources === 0) {
    numText = "No sources available.";
  } else if (numSources === 1) {
    numText = "1 source available.";
  } else {
    numText = `${numSources} sources available.`;
  }

  // Link sources
  const linkElement = document.createElement("a");
  const sourceText = document.createTextNode(` ${numText}`);
  const sourceLink = advisory.source;
  linkElement.title = ` ${numText}`;
  linkElement.appendChild(sourceText);
  linkElement.href = sourceLink;
  const advisoryLink = numberText.appendChild(linkElement);

  return advisoryLink;
}

function setMapLocation(lat, lon, message, advisoryLink) {
  const leafletOptions = {
    key: "9N1YXUo4GoPgLBOjB85IYsz5CwIUgzce",
    verbose: true,
    lat,
    lon,
    zoom: 4,
  };

  windyInit(windyOptions, (windyAPI) => {
    const { map } = windyAPI;
    map.setView([lat, lon], leafletOptions.zoom);
    const marker = L.marker([lat, lon]).addTo(map);
    const content = `${message} ${advisoryLink}`;
    marker.bindPopup(content);
    marker.openPopup();
  });
}

const windyOptions = {
  key: "9N1YXUo4GoPgLBOjB85IYsz5CwIUgzce",
  verbose: true,
  lat: 50.4,
  lon: 14.3,
  zoom: 0,
};

windyInit(windyOptions);

getCountriesFromApi();
