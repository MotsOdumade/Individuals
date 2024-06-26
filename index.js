// functions that need updating to actually query the database are in helpers.js
// import functions from helpers.js
const {
      valid_request,
      authorised,
      data_to_chart,
      task_status_request,
      num_projects_request,
      num_tasks_request,
      deadlines_met_request,
      weekly_completion_request,
      member_projects_request,
      task_weight_breakdown_request,
      employee_role_request
} = require('./helpers');

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



app.get('/v1.1/data-analytics/individual-analytics', (req, res) => {
      
       // clean query parameters
        const dataRequested = (req.query.data || '').trim().replace(/<[^>]*>/g, '');
        const accessCode = (req.query['access-code'] || '').trim().replace(/<[^>]*>/g, '');
        const dataAbout = (req.query['data-about'] || '').trim().replace(/<[^>]*>/g, '');
        const targetId = (req.query['target-id'] || '').trim().replace(/<[^>]*>/g, '');
        const when = (req.query.when || '').trim().replace(/<[^>]*>/g, '');

      // prepare the response object
      // ensure you're using a uniform interface!
      const responseObj = {
            'cacheable' : false,
            'valid-request': false,
            'authorised' : false,
            'display-as' : '',
            'suggested-title' : '',
            'description' : 'description of analytics-data',
            'analytics-data' : []
      };


      // check validity of request (check if all data required for the request has been given)
      if (valid_request(dataRequested, accessCode, dataAbout, targetId) === false){
            // missing data or wrong keywords specified in the request
            return res.json(responseObj);
      } else {
            // update the response object
            responseObj['valid-request'] = true;
      }
      


      // check authorisation
      if (authorised(accessCode) === false){
            // unauthorised data access
            return res.json(responseObj);
      } else {
            responseObj['authorised'] = true;
            // update response object with expected chart type
            const displayType = data_to_chart(dataRequested);
            responseObj['display-as'] = displayType;
      }
      
      // they're authorised - carry out the request
      switch (dataRequested) {
            case "task-status-proportions":
                  // a progress bar showing proportion of current tasks that are in progress, not started or completed
                  
                  task_status_request(targetId)
                      .then(taskStatusObj => {
                          responseObj['suggested-title'] = taskStatusObj['title'];
                          responseObj['analytics-data'] = taskStatusObj['sampleData'];
                          res.json(responseObj);
                      })
                      .catch(error => {
                          console.error('Error task status proportions:', error);
                          // Handle the error here
                          res.status(500).json({ error: 'Internal server error' });
                      });
                  break;
            case "deadlines-met":
                  // a progress-bar showing the proportion of deadlines that the individual has met in the last 7 days
                  const deadlinesMetObj = deadlines_met_request(targetId);
                  responseObj['suggested-title'] = deadlinesMetObj['title'];
                  responseObj['analytics-data'] = deadlinesMetObj['sampleData'];
                  return res.json(responseObj);
                  break;
            case "weekly-task-completion":
                  // a line chart showing the (weighted) task completion over time (by Month not by Week)
                  weekly_completion_request(targetId)
                      .then(weeklyCompletionObj => {
                          responseObj['suggested-title'] = weeklyCompletionObj['title'];
                          responseObj['analytics-data'] = weeklyCompletionObj['sampleData'];
                          res.json(responseObj);
                      })
                      .catch(error => {
                          console.error('Error fetching monthly completion:', error);
                          // Handle the error here
                          res.status(500).json({ error: 'Internal server error' });
                      });
                  break;
            case "num-projects":
            // a stat describing the number of projects that an individual is currently associated with
                  num_projects_request(targetId)
                      .then(numProjectsObj => {
                          responseObj['suggested-title'] = numProjectsObj['title'];
                          responseObj['analytics-data'] = numProjectsObj['sampleData'];
                          res.json(responseObj);
                      })
                      .catch(error => {
                          console.error('Error fetching number of projects:', error);
                          // Handle the error here
                          res.status(500).json({ error: 'Internal server error' });
                      });
                  break;
            case "num-tasks":
            // a stat describing the number of tasks that an individual is currently associated with
                  num_tasks_request(targetId)
                      .then(numTasksObj => {
                          responseObj['suggested-title'] = numTasksObj['title'];
                          responseObj['analytics-data'] = numTasksObj['sampleData'];
                          res.json(responseObj);
                      })
                      .catch(error => {
                          console.error('Error fetching number of projects:', error);
                          // Handle the error here
                          res.status(500).json({ error: 'Internal server error' });
                      });
                  break;
            case "member-projects":
                  // returning a list of objects representing the projects that the user is a member of 
                  member_projects_request(targetId)
                      .then(memberProjectsObj => {
                          responseObj['suggested-title'] = memberProjectsObj['title'];
                          responseObj['analytics-data'] = memberProjectsObj['sampleData'];
                          res.json(responseObj);
                      })
                      .catch(error => {
                          console.error('Error fetching member projects:', error);
                          // Handle the error here
                          res.status(500).json({ error: 'Internal server error' });
                      });
                  break;
            case "task-weight-breakdown":
                  task_weight_breakdown_request(targetId)
                      .then(taskWeightsObj => {
                          responseObj['suggested-title'] = taskWeightsObj['title'];
                          responseObj['analytics-data'] = taskWeightsObj['sampleData'];
                          res.json(responseObj);
                      })
                      .catch(error => {
                          console.error('Error fetching number of projects:', error);
                          // Handle the error here
                          res.status(500).json({ error: 'Internal server error' });
                      });
                  break;
            case "employee-role":
            // a stat describing the number of tasks that an individual is currently associated with
                  employee_role_request(targetId)
                      .then(employeeRoleObj => {
                          responseObj['suggested-title'] = employeeRoleObj['title'];
                          responseObj['analytics-data'] = employeeRoleObj['sampleData'];
                          res.json(responseObj);
                      })
                      .catch(error => {
                          console.error("Error fetching user's role:", error);
                          // Handle the error here
                          res.status(500).json({ error: 'Internal server error' });
                      });
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
// ------ PIE CHART - completed / not started / in progress active tasks - specify data = task-status-proportions
// ------ PROGRESS BAR - deadlines met in last 7 days - specify data = deadlines-met
// ------ LINE GRAPH - task weight completion each week specify data = weekly-task-completion
        

});

httpServer.listen(HTTP_PORT, () => {
    console.log(`Individuals API Server is running Server is running on port ${HTTP_PORT}`);
});
