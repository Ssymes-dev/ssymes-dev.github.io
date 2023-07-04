//populate dropdown and log choice

const dropdownMenu = document.getElementById("allCountries");
const submitButton = document.querySelector(".btn");

getCountriesFromApi();
submitButton.onclick = (e) => {
  e.preventDefault();
  const countryCode = dropdownMenu.value;
  apiObject(countryCode);
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
const options = {
  key: "9N1YXUo4GoPgLBOjB85IYsz5CwIUgzce",
  // include other start-up parameters here
};

function windyLogic() {
  console.log("windy sucess");
  // windy logic here
}

windyInit(options, windyLogic);
var map = L.map("map").setView([51.505, -0.09], 13);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);
// *phase 2*
//create a function that will take the country name and return the score and message
//create a function that will take the score and message and return a color
//associate counrty flag with country name
