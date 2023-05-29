// two letter country codes (api)
const choice = document.querySelector (select);
console.log(choice);
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



// displays all information from API onclick 
function show() {
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


// create function to display choosen country
//display country based on dropdown
//create a function that will take the country name and return the score and message
//create a function that will take the score and message and return a color
//associate counrty flag with country name