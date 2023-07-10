//populate dropdown and log choice

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

// function to populate dropdown menu
function getCountriesFromApi() {
  const apiUrl = "https://www.travel-advisory.info/api";
  fetch(apiUrl)
    .then((response) => response.json())
    .then((result) => {
      const data = result.data;

      for (const list in data) {
        const countryName = data[list].name;
        const choice = document.createElement("option");
        choice.value = list;
        choice.textContent = countryName;
        dropdownMenu.appendChild(choice);
      }
    });
}

// create function to take in countryCode and manupulate info
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
        listItem.append(`${data[country].advisory.message}`);

        const numSources = data[country].advisory.sources_active;
        let numText;
        if (numSources === 0) {
          numText = "No sources available.";
        } else if (numSources === 1) {
          numText = "1 source available.";
        } else {
          numText = `${numSources} sources available.`;
        }

        // link sources
        const linkElement = document.createElement("a");
        const sourceText = document.createTextNode(` ${numText}`);
        const sourceLink = data[country].advisory.source;
        linkElement.title = ` ${numText}`;
        linkElement.appendChild(sourceText);
        linkElement.href = sourceLink;
        listItem.appendChild(linkElement);

        countryList.appendChild(listItem);
      }
    });
}

// map
var map = L.map("map").setView([51.505, -0.09], 13);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);
// openweathermap layers
// L.tileLayer(
//   `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=efa153cb7f3aabbfc22da92129ec3413`
// ).addTo(map);
// L.tileLayer(
//   "https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=efa153cb7f3aabbfc22da92129ec3413"
// ).addTo(map);

// L.tileLayer(
//   "https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=efa153cb7f3aabbfc22da92129ec3413"
// ).addTo(map);
function getWeatherForecast(countryCode) {
  const weatherApi = `http://api.openweathermap.org/geo/1.0/direct?q=${countryCode}&appid=efa153cb7f3aabbfc22da92129ec3413`;

  fetch(weatherApi)
    .then((response) => response.json())
    .then((data) => {
      for (const weatherInfo in data) {
        const countryName = data[weatherInfo].country;
        const lat = data[weatherInfo].lat;
        const lon = data[weatherInfo].lon;
        console.log(countryName, lon, lat);
      }
    });
}
// *phase 2*
//create a function that will take the country name and return the score and message
//create a function that will take the score and message and return a color
//associate counrty flag with country name
