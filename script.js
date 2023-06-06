//populate dropdown and log choice
const dropdownMenu = document.getElementById("allCountries");

const submitButton = document.querySelector(".btn");

submitButton.onclick = (e) => {
  e.preventDefault();
  display(dropdownMenu.value);
  console.log(dropdownMenu.value);
};

async function display() {
  let apiData;
  const response = await fetch("https://www.travel-advisory.info", {
    mode: "no-cors",
    headers: {
      "Acess-Control-Allow-Origin": "*",
    },
  });

  apiData = await response.json();
  console.log(apiData);
}
display();

// // *WIP* parse locally stored API

// //create a function that will take the country name and return the score and message
// //create a function that will take the score and message and return a color
// //associate counrty flag with country name
