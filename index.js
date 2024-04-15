const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const app = express();
// HTTP server
const httpServer = http.createServer(app);
const HTTP_PORT = 3001;


// Define your Express routes here
// ------ handle GET requests -----------------------

app.get('/v1/individual-analytics', (req, res) => {

// ------ first request authorisation from authorisation api
        const apiCUrl = 'http://localhost:3004/v1/authorisation'; // Assuming authorisation api is running on localhost:3004
        http.get(apiCUrl, (response) => {
            let data = '';
            // 'data' will be an array holding the authorisation status
            response.on('data', (chunk) => { data += chunk; });
            // The whole response has been received
            response.on('end', () => {
                data = JSON.parse(data);
                responseObj = {
                    'cacheable': false,
                    'authorised': data["authorised"]
                };
                console.log('Authorisation Verdict: ', data);
                res.json(responseObj);
            });


// ------ authorised so can then now carry out the user's request
            // do something
            
// ------ if there was an issue with accessing the authorisation api
        }).on("error", (error) => {
                console.error('Error calling authorisation verdict:', error);
                res.status(500).send('Internal Server Error');
        });
});

httpServer.listen(HTTP_PORT, () => {
    console.log(`HTTP Server is running on port ${HTTP_PORT}`);
});
