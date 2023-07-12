const dropdownMenu = document.getElementById("allCountries");
const submitButton = document.querySelector(".btn");

getCountriesFromApi();
submitButton.onclick = (e) => {
  e.preventDefault();
  const countryCode = dropdownMenu.value;
  apiObject(countryCode);
  getWeatherForecast(countryCode);
  dropdownMenu.selectedIndex = -1;
  console.log(countryCode);
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
function apiObject(countryCode) {
  const apiUrl = `https://www.travel-advisory.info/api?countrycode=${countryCode}`;
  fetch(apiUrl)
    .then((response) => response.json())
    .then((result) => {
      const data = result.data;
      console.log(data);
      const countryList = document.getElementById("country-list");

      // Clear previous content
      countryList.innerHTML = "";

      for (const country in data) {
        const listItem = document.createElement("p");

        // Create countryName title
        const countryName = document.createElement("h1");
        countryName.textContent = data[country].name;
        listItem.appendChild(countryName);

        // Append advisory message
        // listItem.append(`${data[country].advisory.message}`);

        const numSources = data[country].advisory.sources_active;
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
        const sourceLink = data[country].advisory.source;
        linkElement.title = ` ${numText}`;
        linkElement.appendChild(sourceText);
        linkElement.href = sourceLink;
        listItem.appendChild(linkElement);

        countryList.appendChild(listItem);
      }

      // Fetch latitude and longitude from OpenCage Geocoding API
      const OPEN_CAGE_API_KEY = "0c9aade54fba4c8abfae724859a72795";
      const geocodingApiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${data[countryCode].name}&key=${OPEN_CAGE_API_KEY}`;
      fetch(geocodingApiUrl)
        .then((response) => response.json())
        .then(({ results }) => {
          const { lat, lng } = results[0].geometry;
          setMapLocation(
            lat,
            lng,
            data[countryCode].advisory.message,
            data[countryCode].advisory.sources_active
          );
        });
    });
}

// Function to set map location and create marker
function setMapLocation(lat, lon, message, sources) {
  const options = {
    key: "9N1YXUo4GoPgLBOjB85IYsz5CwIUgzce",
    verbose: true,
    lat,
    lon,
    zoom: 4,
  };

  // Initialize Windy API
  windyInit(options, (windyAPI) => {
    const { map } = windyAPI;
    map.setView([lat, lon], options.zoom);

    // Create a marker with the advisory message and sources
    const marker = L.marker([lat, lon]).addTo(map);
    const content = `${message}<br>Sources: ${sources}`;
    marker.bindPopup(content);
    marker.openPopup();
  });
}

// windy options
const options = {
  key: "9N1YXUo4GoPgLBOjB85IYsz5CwIUgzce",
  verbose: true,
  lat: 50.4,
  lon: 14.3,
  zoom: 0,
};

// Initialize Windy API
windyInit(options);

// *phase 2*
// Create a function that will take the country name and return the score and message
// Create a function that will take the score and message and return a color
// Associate country flag with country name
