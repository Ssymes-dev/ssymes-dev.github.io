//populate dropdown and log choice
const dropdownMenu = document.getElementById("allCountries");

const submitButton = document.querySelector(".btn");

let countryCode = {};
submitButton.onclick = (e) => {
  e.preventDefault();
  choice = dropdownMenu.value;
  console.log(countryCode);
};

<<<<<<< HEAD
let info = {};
fetch(`https://www.travel-advisory.info/api`)
=======
function display() {
  var choice = document.getElementById("country-list").value;
  console.log(choice);
}

const myList = document.querySelector("ul");
const apiData = `https://www.travel-advisory.info/api`;
fetch(apiData)
>>>>>>> 6eca3e088665a601c00d48eecb6c2d375dd34138
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
