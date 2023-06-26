//populate dropdown and log choice

const dropdownMenu = document.getElementById("allCountries");
const submitButton = document.querySelector(".btn");

getCountries();
submitButton.onclick = (e) => {
  e.preventDefault();
  const countryCode = dropdownMenu.value;
  apiObject(countryCode);
  dropdownMenu.selectedIndex = -1;
  console.log(countryCode);
};

// function to populate dropdown menu
function getCountries() {
  const apiUrl = "https://www.travel-advisory.info/api";
  fetch(apiUrl)
    .then((response) => response.json())
    .then((result) => {
      const data = result.data;

      for (const list in data) {
        const countryName = data[list].name;
        const option = document.createElement("option");
        option.value = list;
        option.textContent = countryName;
        dropdownMenu.appendChild(option);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// create function to take in countryCode and manupulate info
function getObjectFromAPI(countryCode) {
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

        // Create <strong> element for sources
        const sources = document.createElement("strong");
        sources.textContent = ` ${data[country].advisory.sources_active} sources available.`;
        listItem.appendChild(sources);

        countryList.appendChild(listItem);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// *phase 2*
//create a function that will take the country name and return the score and message
//create a function that will take the score and message and return a color
//associate counrty flag with country name
