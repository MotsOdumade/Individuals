const {authorised, data_to_chart } = require('./helpers');
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
        let location = "undecided";
// ------ AUTHORISATION - specified client-token used to verify client's identity and check if they're authorised to access the requested data

// ------ COMPARING
        // self (time period) - specified data-about = self, target-id = user-id and when = time (default = now)
        // average from team - specified data-about = project, target-id = project-id
        // average employee - specified data-about =  avg-employee
// ------ NUMBER OF PROJECTS - specify data = num-projects
// ------ PERFORMANCE REPORT - specify data = performance-report
// ------ PIE CHART - completed / not started / in progress active tasks - specify chart = pie, data = task-status-proportions
// ------ PROGRESS BAR - deadlines met in last 7 days - specify chart = progress-bar, data = deadlines-met
// ------ LINE GRAPH - task weight completion each week specify chart = line, data = weekly-task-completion
        res.json({'authorised': authorised(), 'data': data_to_chart('num-projects')});

});

httpServer.listen(HTTP_PORT, () => {
    console.log(`HTTP Server is running on port ${HTTP_PORT}`);
});
