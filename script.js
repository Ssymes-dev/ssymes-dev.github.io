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
const revealBtn = document.querySelector(".reveal-btn");
const hiddenContent = document.querySelector(".hidden-content");

function revealContent() {
  if (hiddenContent.classList.contains("reveal-btn")) {
    hiddenContent.classList.remove("reveal-btn");
  } else {
    hiddenContent.classList.add("reveal-btn");
  }
}
// why is revealBtn.addEventListener not working?
revealBtn.addEventListener("click", revealContent);
// or
document.addEventListener("click", revealContent);

// displays all information from API onclick
// function show() {
// const API_URL = 'https://www.travel-advisory.info/api';

//     fetch(API_URL)
//     .then(response => response.json())
//     .then(result => {
//         for (const list in result.data) {

//             const countryName = result.data[list].name;
//             const code = result.data[list].iso_alpha2;
//             const countryScore = result.data[list].advisory.score;
//             const countryMessage = result.data[list].advisory.message;
//             const lastUpdated = result.data[list].advisory.updated;
//             const source = result.data[list].advisory.sources_active;

//             const countryList = document.createElement('p');

//             countryList.innerHTML =
//                 `<li>${countryName}:
//                     ${code} <br>
//                     ${countryMessage}<br>
//                     ${countryScore}<br>
//                     ${"Updated" + " " + lastUpdated}<br>
//                     ${"From "+ source+" sources"} </li><br>`;
//             document.getElementById('country-list').append(countryList);
//         }
//     });
//     }

// // create function to display choosen country

// //display country based on dropdown
// //create a function that will take the country name and return the score and message
// //create a function that will take the score and message and return a color
// //associate counrty flag with country name
