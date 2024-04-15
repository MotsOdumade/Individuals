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
    res.send("GET request on individuals resource");
});

httpServer.listen(HTTP_PORT, () => {
    console.log(`HTTP Server is running on port ${HTTP_PORT}`);
});
