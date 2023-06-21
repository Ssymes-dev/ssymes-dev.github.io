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
      for (const list in data) {
        const countryName = data[list].name;
        const code = data[list].iso_alpha2;
        const countryScore = data[list].advisory.score;
        const countryMessage = data[list].advisory.message;
        const lastUpdated = data[list].advisory.updated;
        const source = data[list].advisory.sources_active;

        const countryList = document.createElement("p");

        document.getElementById("country-list").innerHTML = "";

        countryList.innerHTML = `<li>${countryName}:
                    ${code} <br>
                    ${countryMessage}<br>
                    ${countryScore}<br>
                    ${"Updated" + " " + lastUpdated}<br>
                    ${"From " + source + " sources"} </li><br>`;
        document.getElementById("country-list").appendChild(countryList);
      }
    });
}

// *phase 2*
//create a function that will take the country name and return the score and message
//create a function that will take the score and message and return a color
//associate counrty flag with country name
