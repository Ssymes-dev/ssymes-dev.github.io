//populate dropdown and log choice
const dropdownMenu = document.getElementById("allCountries");

const submitButton = document.querySelector(".btn");

submitButton.onclick = (e) => {
  e.preventDefault();
  display(dropdownMenu.value);
  console.log(dropdownMenu.value);
};

function display(countryCode) {
  console.log("hello");
  const apiData = `https://www.travel-advisory.info/api?countrycode=${countryCode}`;
  fetch(apiData)
    .then((response) => response.json())
    .then((result) => {
      console.log(result.data);

      const list = JSON.parse([result.data]);
      const countryList = document.createElement("p");

      countryList.innerHTML = result.data[list].name;

      document.getElementById("country-list").append(countryList);
    });
}
// // *WIP* parse locally stored API

// //create a function that will take the country name and return the score and message
// //create a function that will take the score and message and return a color
// //associate counrty flag with country name
