//populate dropdown and log choice
const dropdownMenu = document.getElementById("allCountries");

let countryCode;
const submitButton = document.querySelector(".btn");
submitButton.onclick = (e) => {
  e.preventDefault();
  getObjectFromAPI(dropdownMenu.value);
  countryCode = dropdownMenu.value;
  console.log(dropdownMenu.value);
};

// create function to take in countryCode and manupulate info
let apiData;
function getObjectFromAPI(countryCode) {
  const apiUrl = `https://www.travel-advisory.info/api?countrycode=${countryCode}`;
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      apiData = data.data;
      console.log(apiData);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
getObjectFromAPI("countryCode");

// *phase 2*
//create a function that will take the country name and return the score and message
//create a function that will take the score and message and return a color
//associate counrty flag with country name
