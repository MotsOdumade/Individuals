const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');

const app = express();

// HTTP server
const httpServer = http.createServer(app);
const HTTP_PORT = 3001;

const axios = require('axios');


// Define your Express routes here
app.get('/v1/individual-analytics', (req, res) => {

    // Define the URL for authorisation API
    const apiCUrl = 'http://localhost:3004/v1/authorisation'; // Assuming API C is running on localhost:3004

    // Make a GET request to authorisation API
    axios.get(apiCUrl)
      .then(response => {
        // Handle the response from API C
        console.log('Response from Authorisation:', response.data);
        // Do something with the response data
      })
      .catch(error => {
        // Handle errors
        console.error('Error calling API C:', error);
      });
        res.send("GET request on individuals resource");
    });

httpServer.listen(HTTP_PORT, () => {
    console.log(`HTTP Server is running on port ${HTTP_PORT}`);
});
