// *WIP* module experement 

class CountryApi {
    constructor(
    countryName,
    code,
    countryScore,
    countryMessage,
    lastUpdated,
    source
    )
    {
        this.countryName = countryName;
        this.code = code;
        this.countryScore = countryScore; 
        this.countryMessage = countryMessage;
        this.lastUpdated = lastUpdated;
        this.source = source;
    }}
    
show() {
    const API_URL = "https://www.travel-advisory.info/api";

  fetch(API_URL)
    .then((response) => response.json())
    .then((result) => {
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
 } })}
}
export default countryApi;

