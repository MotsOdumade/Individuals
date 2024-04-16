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
      
       // Handle params
        const dataRequested = (req.query.data || '').trim().replace(/<[^>]*>/g, '');
        const clientToken = (req.query['client-token'] || '').trim().replace(/<[^>]*>/g, '');
        const dataAbout = (req.query['data-about'] || '').trim().replace(/<[^>]*>/g, '');
        const targetId = (req.query['target-id'] || '').trim().replace(/<[^>]*>/g, '');
        const when = (req.query.when || '').trim().replace(/<[^>]*>/g, '');

      // prepare the response object
      const responseObj = {
            'cacheable' : false,
            'valid-request': false,
            'authorised' : false,
            'chart-type' : '',
            'data' : []
            
      };


      // check validity of request
      if (validRequest(dataRequested, clientToken, dataAbout, targetId) === false){
            // missing data or wrong keywords specified in the request
            return res.json(responseObj);
      }
      responseObj['valid-request'] = true;


      // check authorisation
      if (authorised(clientToken, dataAbout, targetId) === false){
            // unauthorised data access
            return res.json(responseObj);
      }
      responseObj['authorised'] = true;

      
      // update response object with expected chart type
      responseObj['chart-type'] = data_to_chart(dataRequested);

      
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
        res.json({'authorised': authorised(), 'data': data_to_chart(dataRequested)});

});

httpServer.listen(HTTP_PORT, () => {
    console.log(`HTTP Server is running on port ${HTTP_PORT}`);
});
