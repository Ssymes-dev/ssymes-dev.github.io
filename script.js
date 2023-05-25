// // populates dropdown list with country names from API
// let countries = "https://www.travel-advisory.info/api"

// fetch(countries)
// .then(response => response.json())
// .then(result => {
//     for (const choices in result.data) {
//         const countryName = result.data[choices].name;
      
//         const choiceList = document.createElement('option');

//         choiceList.innerHTML =
//     `<li>${countryName}</li>`;
// document.getElementById('slctCountries').append(choiceList);
// }});

// displays all information from API onclick
function show(){
const API_URL = 'https://www.travel-advisory.info/api';

    fetch(API_URL)
    .then(response => response.json())
    .then(result => {
        for (const list in result.data) {
            
            const countryName = result.data[list].name;
            const code = result.data[list].iso_alpha2;
            const countryScore = result.data[list].advisory.score;
            const countryMessage = result.data[list].advisory.message;
            const lastUpdated = result.data[list].advisory.updated;
            const source = result.data[list].advisory.sources_active;

            const countryList = document.createElement('p');
        
            countryList.innerHTML = 
                `<li>${countryName}:
                    ${code} <br>
                    ${countryMessage}<br>
                    ${countryScore}<br>
                    ${"Updated" + " " + lastUpdated}<br>
                    ${"From "+ source+" sources"} </li><br>`;
            document.getElementById('country-list').append(countryList);
        }
     
    });
    }

const countryChoice = document.getElementById('slctCountries')
console.log('countryChoice', countryChoice)

// create function to display choosen country
function showOne(){

}



//display country based on dropdown
//create a function that will take the country name and return the score and message
//create a function that will take the score and message and return a color
//associate counrty flag with country name