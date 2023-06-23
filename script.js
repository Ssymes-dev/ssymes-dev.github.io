//populate dropdown and log choice

const dropdownMenu = document.getElementById("allCountries");
const submitButton = document.querySelector(".btn");

submitButton.onclick = (e) => {
  e.preventDefault();
  const countryCode = dropdownMenu.value;
  getObjectFromAPI(countryCode);
  dropdownMenu.selectedIndex = -1;
  console.log(countryCode);
};

// create function to take in countryCode and manupulate info
function getObjectFromAPI(countryCode) {
  const apiUrl = `https://www.travel-advisory.info/api?countrycode=${countryCode}`;
  fetch(apiUrl)
    .then((response) => response.json())
    .then((result) => {
      const data = result.data;
      console.log(data);
      const countryList = document.getElementById("country-list");

      // Clears previous content
      countryList.innerHTML = "";

      for (const country in data) {
        const listItem = document.createElement("p");

        // Create <h1> element for country name
        const countryName = document.createElement("h1");
        countryName.textContent = data[country].name;
        listItem.appendChild(countryName);

        // Append advisory message
        listItem.append(`${data[country].advisory.message}`);

        // Create <strong> element for number of sources available
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
