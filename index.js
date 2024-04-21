const {valid_request, authorised, data_to_chart, task_status_request, num_projects_request } = require('./helpers');
const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const app = express();
// HTTP server
const httpServer = http.createServer(app);
const HTTP_PORT = 3001;


// Define your Express routes here
// ------ handle GET requests to /v1/individual-analytics -----------------------

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
            'suggested-title' : '',
            'graph-data' : []
            
      };


      // check validity of request
      if (valid_request(dataRequested, clientToken, dataAbout, targetId) === false){
            // missing data or wrong keywords specified in the request
            return res.json(responseObj);
      } else {
            // update the response object
            responseObj['valid-request'] = true;
      }
      


      // check authorisation
      if (authorised(clientToken, dataAbout, targetId) === false){
            // unauthorised data access
            return res.json(responseObj);
      } else {
            responseObj['authorised'] = true;
            // update response object with expected chart type
            const chartType = data_to_chart(dataRequested);
            responseObj['chart-type'] = chartType;
      }
      
      // carry out the request
      switch (dataRequested) {
            case "task-status-proportions":
                  // a pie chart showing proportion of current tasks that are in progress, not started or completed
                  const taskStatusObj = task_status_request(dataAbout, targetId, when);
                  responseObj['suggested-title'] = taskStatusObj['title'];
                  responseObj['graph-data'] = taskStatusObj['sampleData'];
                  break;
            case "deadlines-met":
                  // a progress-bar showing the proportion of deadlines that the individual has met in the last 7 days
                  break;
            case "weekly-task-completion":
                  // a line chart showing the (weighted) task completion over time (by week) 
                  break;
            case "num-projects":
                  // a stat describing the number of projects that an individual is currently associated with
                  const numProjectsObj = num_projects_request(dataAbout, targetId, when);
                  responseObj['suggested-title'] = numProjectsObj['title'];
                  responseObj['graph-data'] = {'num-projects': numProjectsObj['sampleData']};
                  break;
        
  
        default:
                  // indicates a request option that hasn't yet been implemented
                  // performance-report
         
      }
      
      

// ------ COMPARING
        // self (time period) - specified data-about = self, target-id = user-id and when = time (default = now)
        // average from team - specified data-about = project, target-id = project-id
        // average employee - specified data-about =  avg-employee
// ------ NUMBER OF PROJECTS - specify data = num-projects
// ------ PERFORMANCE REPORT - specify data = performance-report
// ------ PIE CHART - completed / not started / in progress active tasks - specify chart = pie, data = task-status-proportions
// ------ PROGRESS BAR - deadlines met in last 7 days - specify chart = progress-bar, data = deadlines-met
// ------ LINE GRAPH - task weight completion each week specify chart = line, data = weekly-task-completion
        return res.json(responseObj);

});

httpServer.listen(HTTP_PORT, () => {
    console.log(`Individuals API Server is running Server is running on port ${HTTP_PORT}`);
});
