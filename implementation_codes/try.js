// Importing the required modules
const axios = require("axios");
const fs = require("fs");

// Define the API endpoint URL
const apiUrl =
  "https://api.github.com/search/issues?q=repo:ansible/ansible+label:bug+state:closed&page=1&per_page=100"; // Replace this with your actual API endpoint

const outputFile = "api_response.txt";

// Make a GET request using Axios
axios
  .get(apiUrl, {
    method: "GET",
    headers: { Authorization: `token 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` },
  })
  .then((response) => {
    // Log the result to the console
    fs.writeFileSync(outputFile, JSON.stringify(response.data, null, 2));
  })
  .catch((error) => {
    // Handle errors
    console.error("Error making API request:", error.message);
  });
