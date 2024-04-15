const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');

const app = express();

// HTTP server
const httpServer = http.createServer(app);
const HTTP_PORT = 3001;




// Define your Express routes here
app.get('/v1/individual-analytics', (req, res) => {

    // Define the URL for authorisation API
    const apiCUrl = 'http://localhost:3004/v1/authorisation'; // Assuming API C is running on localhost:3004

    // Make a GET request to authorisation API
    http.get(apiCUrl, (response) => {
        let data = '';
        // A chunk of data has been received
        response.on('data', (chunk) => {
            data += chunk;
        });
        // The whole response has been received
        response.on('end', () => {
            console.log('Response from Authorisation:', data);
            // Do something with the response data
            res.send("GET request on individuals resource");
        });
    }).on("error", (error) => {
        // Handle errors
        console.error('Error calling API C:', error);
        res.status(500).send('Internal Server Error');
    });
});

httpServer.listen(HTTP_PORT, () => {
    console.log(`HTTP Server is running on port ${HTTP_PORT}`);
});
