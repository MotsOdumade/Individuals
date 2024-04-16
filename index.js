const {authorised } = require('./helpers');
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

// ------ AUTHORISATION - specified client-token used to verify client's identity and check if they're authorised to access the requested data
// ------ COMPARING
        // self (time period) - default = now - specified individual-id and time?
        // average from team - specified project-id 
        // average employee - specified avg-employee as true
// ------ NUMBER OF PROJECTS - specify data = num-projects
// ------ PIE CHART - completed / not started / in progress active tasks - specify chart = pie, data = task-status
// ------ PROGRESS BAR - deadlines met in last 7 days - specify chart = progress-bar, data = deadlines-met
// ------ LINE GRAPH - task weight completion each week specify chart = line, data = weekly-completion
        res.json({'authorised': true, 'data': authorised()});
});

httpServer.listen(HTTP_PORT, () => {
    console.log(`HTTP Server is running on port ${HTTP_PORT}`);
});
