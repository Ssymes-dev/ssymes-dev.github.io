// logs two letter country codes
// const choice = document.getElementsByClassName ('dropdownCon')
// console.log(choice);
// const API = 'https://www.travel-advisory.info/api'
// let feedback;
// fetch(API)
//     .then(response => response.json())
//     .then(result => {
//         for (const list in result.data) {
//             const code = result.data[list].iso_alpha2;

//             const countryList = document.createElement('p');

//             countryList.innerHTML =
//                 `${code}`;

//     if (choice === API) {
//         feedback = "Sucess";
//     } else {
//         feedback = "fail"
//     }
//    const answer = document.createElement ('p')
//    answer.innerHTML = feedback;

// }
//                     console.log(list);
//         }
//     )

// experimenting with adding event listener >> element.addEventListener("click", function);
// this will evenually apply to API data
const revealBtn = document.querySelector(".reveal-btn");
const hiddenContent = document.querySelector(".hidden-content");

function revealContent() {
  if (hiddenContent.classList.contains("reveal-btn")) {
    hiddenContent.classList.remove("reveal-btn");
  } else {
    hiddenContent.classList.add("reveal-btn");
  }
}
revealBtn.addEventListener("click", revealContent);

const dropdownMenu = document.getElementById("slctCountries");

const submitButton = document.querySelector(".btn");

submitButton.onclick = (e) => {
  e.preventDefault();
  show(dropdownMenu.value);
  console.log(dropdownMenu.value);
};

// *WIP* assigns input from dropdown to a variable

// dropdownMenu.addEventListener('change', show ()){
//     var countryValue = this.options[this.selectedIndex].value;
//     var countryText = this.options[this.selectedIndex].text;
//     window.location = locationValue;
//  });

// displays all information from API onclick

function show(countryCode) {
  console.log("hello");
  const API_URL = `https://www.travel-advisory.info/api?countrycode=${countryCode}`;
  //   append country code

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

// // create function to display choosen country

// //display country based on dropdown
// //create a function that will take the country name and return the score and message
// //create a function that will take the score and message and return a color
// //associate counrty flag with country name
