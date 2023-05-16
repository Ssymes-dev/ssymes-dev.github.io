const API_URL = 'https://www.travel-advisory.info/api';



fetch(API_URL)

// takes response from URL and turns it into a .json file
.then(response => response.json())
// response.json file is named data
.then(data => {
    for (const list in data.data) {
        const countryName = data.data[list].name;
        const code = data.data[list].iso_alpha2;
        const countryScore = data.data[list].advisory.score;
        const countryMessage = data.data[list].advisory.message;
        const lastUpdated = data.data[list].advisory.updated;
       



        // colorcoding 
        // const countryColor = data.data[list].advisory.color;
        // function countryColor(countryScore) {
        //     if (countryScore >= 5) {
        //         return "black";
        //     } else if (countryScore >= 4) {
        //         return "red";
        //     } else if (countryScore >= 3) {
        //         return "orange";
        //     } else if (countryScore >= 2) {
        //         return "yellow";
        //     } else if (countryScore >= 1) {
        //         return "green";
        //     } else {
        //         return "blue";
        //     }
        // }


        const countryList = document.createElement('li');
    countryList.innerHTML = `${countryName}: ${code} ${countryMessage} ${countryScore} ${"Updated" + " " + lastUpdated}`;
        document.getElementById('country-list').append(countryList);
    }
})

//pop countries?

// create drop down list of countries
// create a function that will take the country name and return the score and message
// create a function that will take the score and message and return a color