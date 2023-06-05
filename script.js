//shows selected country on page. does not clear choice before new choice is made.
const dropdownMenu = document.getElementById("slctCountries");

const submitButton = document.querySelector(".btn");

submitButton.onclick = (e) => {
  e.preventDefault();
  show(dropdownMenu.value);
  console.log(dropdownMenu.value);
};

// displays all information from API onclick
function show(countryCode) {
  console.log("hello");
  const API_URL = `https://www.travel-advisory.info/api?countrycode=${countryCode}`;

  fetch(API_URL)
    .then((response) => response.json())
    .then((result) => {
      console.log(result.data);
      for (const list in result.data) {
        const countryName = result.data[list].name;
        const code = result.data[list].iso_alpha2;
        const countryScore = result.data[list].advisory.score;
        const countryMessage = result.data[list].advisory.message;
        const lastUpdated = result.data[list].advisory.updated;
        const source = result.data[list].advisory.sources_active;

        const countryList = document.createElement("p");

        countryList.innerHTML = `<li>${countryName}:
                    ${code} <br>
                    ${countryMessage}<br>
                    ${countryScore}<br>
                    ${"Updated" + " " + lastUpdated}<br>
                    ${"From " + source + " sources"} </li><br>`;
        document.getElementById("country-list").append(countryList);
      }
    });
}

// //create a function that will take the country name and return the score and message
// //create a function that will take the score and message and return a color
// //associate counrty flag with country name
