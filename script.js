//populate dropdown and log choice
const dropdownMenu = document.getElementById("allCountries");

const submitButton = document.querySelector(".btn");

let countryCode = {};
submitButton.onclick = (e) => {
  e.preventDefault();
  choice = dropdownMenu.value;
  console.log(countryCode);
};

let info = {};
fetch(`https://www.travel-advisory.info/api`)
  .then((response) => response.json())
  .then((result) => {
    info = result.data;
    display(countryCode);
  });

// create function to take in countryCode and manupulate info
// to isolate one object in console
function display(countryCode) {
  console.log(info);
  return info.object === `${countryCode}`;
}

// *phase 2*
//create a function that will take the country name and return the score and message
//create a function that will take the score and message and return a color
//associate counrty flag with country name
