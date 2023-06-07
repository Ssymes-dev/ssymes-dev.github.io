//populate dropdown and log choice
const dropdownMenu = document.getElementById("allCountries");

const submitButton = document.querySelector(".btn");

submitButton.onclick = (e) => {
  e.preventDefault();
  // display(dropdownMenu.value); how to pass variable now that function is gone
  console.log(dropdownMenu.value);
};

const myList = document.querySelector("ul");
const apiData = `https://www.travel-advisory.info/api`;
fetch(apiData)
  .then((response) => response.json())
  .then((result) => {
    console.log(result.data);
    for (const country in result.data) {
      const listItem = document.createElement("li");
      listItem.appendChild(document.createElement("strong")).textContent =
        result.data[country].name;
      listItem.append` ${result.data[country].advisory.message}`;
      listItem.appendChild(
        document.createElement("strong")
      ).textContent = `${result.data[country].advisory.sources_active} sources avaliable`;
      myList.appendChild(listItem);
    }
  })

  .catch(console.error);

// // *WIP* parse locally stored API

// //create a function that will take the country name and return the score and message
// //create a function that will take the score and message and return a color
// //associate counrty flag with country name
