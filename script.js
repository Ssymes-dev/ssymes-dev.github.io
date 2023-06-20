//populate dropdown and log choice
const dropdownMenu = document.getElementById("allCountries");

const submitButton = document.querySelector(".btn");

let { countryCode } = (submitButton.onclick = (e) => {
  e.preventDefault();
  countryCode = dropdownMenu.value;
  console.log(countryCode);
});

let { info } = fetch(`https://www.travel-advisory.info/api`)
  .then((response) => response.json())
  .then((result) => {
    info = result.data;
    display();
    console.log(Object.keys(info));
  });

// create function to take in countryCode and manupulate info
// to isolate one object in console
function display(countryCode) {
  for (const list in info) {
    const countryMessage = info[list].advisory.message;
    let result;
    if ((countryCode = Object.keys(info))) {
      result = "sucess";
    } else {
      result = "error";
    }
    console.log(countryMessage);
  }
}

// *phase 2*
//create a function that will take the country name and return the score and message
//create a function that will take the score and message and return a color
//associate counrty flag with country name
