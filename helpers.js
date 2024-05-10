// functions defined here will be used in index.js
// database credentials are specified in a .env file stored within the same package on the remote machine
// check authorised() for an example of how to query the database and process the results

const mysql = require('mysql');
require('dotenv').config();

const dataChartDict = {
      'weekly-task-completion': 'line',
      'deadlines-met': 'progressBar',
      'task-status-proportions': 'pie',
      'num-projects': 'stat',
      'member-projects': 'list',
      'task-weight-breakdown': 'pie',
      'num-tasks': 'stat'
      // performance-report ought to be broken down further
};

const listDataAbout = ['self', 'project', 'avg-employee']; // all-projects option is handles separately

function execute_sql_query(sql_query) {
    return new Promise((resolve, reject) => {
        // Create a connection to the database using environment variables
        const connection = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
        });

        // Connect to the database
        connection.connect((err) => {
            if (err) {
                console.error('Error connecting to the database:', err);
                reject(err);
                return;
            }
            // Execute a query
            console.log('Connected to the database');
            connection.query(sql_query, (err, results) => {
                // Close the connection
                connection.end();
                if (err) {
                    console.error('Error executing query:', err);
                    reject(err);
                    return;
                }
                // Map each row to a plain JavaScript object
                const formattedResults = results.map(row => {
                    const formattedRow = {};
                    for (const key in row) {
                        formattedRow[key] = row[key];
                    }
                    return formattedRow;
                });
                // Resolve the promise with the formatted results
                resolve(formattedResults);
            });
        });
    });
}

function valid_request(data_requested, access_code, data_about, target_id){
      // check if the request is missing necessary information
  if (Object.keys(dataChartDict).includes(data_requested) === false){
        return false;
  }
  if (access_code == ''){
        return false;
  }
  if ((listDataAbout.includes(data_about) === false) && (data_requested != 'member-projects')){ // data-about isn't required for 'member-projects'
        return false;
  }
  if (data_about == 'avg-employee'){ // target-id isn't required for avg-employee
        return true;
  } 
  if (target_id == ''){
        return false;
  }
  
  if (isNaN(target_id)){
        // it's not a number
        return false;
  }
  return true;
}



function authorised(access_code) {
    // verify the access code provided
    if (access_code == process.env.ACCESS_CODE){
      // correct access code for company-analytics code 
      
      return true;
    } 
    // else incorrect access_code 
    return false;
    
}



function data_to_chart(data_requested){
  
  // -- matches dataRequest to a chart type - probably unnecessary
  const chart = dataChartDict[data_requested];
  return chart;
}

// ---- functions to execute requests

function task_status_request(dataAbout, targetId, when){
  const title = 'Status of Current Tasks';
  let sampleData = [];
  // query the database
  
  sampleData = [
    ['Complete', 3],
    ['In Progress', 1],
    ['Not Started', 2]
  ];
  
  return {'title': title, 'sampleData': sampleData};
}


async function num_projects_request(dataAbout, targetId, when){
  const title = 'Number of Current Projects';
  let sql_query = `SELECT COUNT(*) AS Projects
        FROM project 
              JOIN project_team_member 
                    ON project.id = project_team_member.project_id 
                          WHERE project_team_member.user_id = ${targetId} 
                                AND STR_TO_DATE('2024-05-17 13:42:04', '%Y-%m-%d %H:%i:%s') < project.deadline;`;
  let sampleData = 0;
  try {
    // query the database
    let queryData = await execute_sql_query(sql_query);
    if (queryData.length > 0){
      sampleData = queryData[0]["Projects"];
    } 
      console.log("num_projects has waited for sql query and got back this many rows", queryData.length);
    return {'title': title, 'sampleData': sampleData};
  } catch (error) {
    console.error('Error executing SQL query:', error);
    // Handle the error here
  }
  
  
}
async function num_tasks_request(dataAbout, targetId, when){
  const title = 'Number of Active Tasks';
  let sql_not_started = `SELECT COUNT(*) as Tasks
        FROM task 
        LEFT JOIN task_start 
        ON task.id = task_start.task_id 
        WHERE task_start.task_id IS NULL 
        AND  deadline > STR_TO_DATE('2024-05-17 13:42:04', '%Y-%m-%d %H:%i:%s') 
        AND assigned_user_id = ${targetId};`;
  let sql_started_not_finished = `SELECT COUNT(*) as Tasks
        FROM task 
        INNER JOIN task_start 
        ON task.id = task_start.task_id 
        LEFT JOIN task_complete 
        ON task.id = task_complete.task_id 
        WHERE task_complete.task_id IS NULL 
        AND deadline > STR_TO_DATE('2024-05-17 13:42:04', '%Y-%m-%d %H:%i:%s') 
        AND assigned_user_id = ${targetId};`;
  let sampleData = 0;
  try {
    // query the database
    let queryData1 = await execute_sql_query(sql_not_started);
    if (queryData1.length > 0){
      sampleData += queryData1[0]["Tasks"];
    } 
    console.log("num_projects has waited for sql query and got back this many rows", queryData1.length);
    try {
    // query the database
    let queryData2 = await execute_sql_query(sql_started_not_finished);
    if (queryData2.length > 0){
      sampleData += queryData2[0]["Tasks"];
    } 
      console.log("num_projects has waited for sql query and got back this many rows", queryData2.length);
    return {'title': title, 'sampleData': sampleData};
  } catch (error) {
    console.error('Error executing SQL query:', error);
    // Handle the error here
  }
    
  } catch (error) {
    console.error('Error executing SQL query:', error);
    // Handle the error here
  }
  
  
}


function deadlines_met_request(dataAbout, targetId, when){
  const title = 'Number of Deadlines Met';
  let sampleData = [
    ['Deadlines Met', 5],
    ['Total Tasks', 6]
  ];
  // could instead use a json format depending on output required for frontend
  return {'title': title, 'sampleData': sampleData};
}

function weekly_completion_request(dataAbout, targetId, when){
  const sampleData = {
        type: 'line',
        data: {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [{
                label: 'Performance',
                data: [65, 59, 80, 81, 56, 55, 40],
                borderColor: 'blue',
                fill: false
            }]
        },
        options: {
            title: {
                display: true,
                text: 'Performance Over Time'
            },
            responsive: false
        }
    };
  const title = 'Weighted Task Completion this Week';
  return {'title': title, 'sampleData': sampleData};
}

function member_projects_request(targetId){
  // returns a list of objects representing the projects that the individual is currently in
  const title = 'Projects Involved In';
  let sampleData = [];
  // query the database
  
  sampleData = [
    {'project-id': '1201', 'project-name': 'Skill Swap Initiative'},
    {'project-id': '1205', 'project-name': 'Office Connect Project'},
    {'project-id': '1202', 'project-name': 'CSR Campaign'},
    {'project-id': '1204', 'project-name': 'Employee Training'},
    {'project-id': '1209', 'project-name': 'Volunteering Campaign'},
    {'project-id': '1207', 'project-name': 'Management System Upgrade'},
    {'project-id': '1200', 'project-name': 'Risk Management Review'},
  ];
  
  return {'title': title, 'sampleData': sampleData};
}

function generateHexColors(numColors) {
  var colors = [];
  for (var i = 0; i < numColors; i++) {
    var color = '#';
    // Generate each component of the color
    for (var j = 0; j < 6; j++) {
      color += Math.floor(Math.random() * 16).toString(16); // Random hex digit
    }
    colors.push(color);
  }
  return colors;
}

async function task_weight_breakdown_request(targetId){
      // sampleData component can be used directly in Chart js's Chart(pieCtx, {}) function
      const title = "Task Weight Breakdown";
      const sql_query = `SELECT name, weight
        FROM task 
        LEFT JOIN task_start 
        ON task.id = task_start.task_id 
        WHERE task_start.task_id IS NULL 
        AND  deadline > STR_TO_DATE('2024-05-17 13:42:04', '%Y-%m-%d %H:%i:%s') 
        AND assigned_user_id = ${targetId}
        UNION
        SELECT name, weight
        FROM task 
        INNER JOIN task_start 
        ON task.id = task_start.task_id 
        LEFT JOIN task_complete 
        ON task.id = task_complete.task_id 
        WHERE task_complete.task_id IS NULL 
        AND deadline > STR_TO_DATE('2024-05-17 13:42:04', '%Y-%m-%d %H:%i:%s') 
        AND assigned_user_id = ${targetId};
        `;
      const sampleData = {
          type: 'pie',
          data: {
              labels: [],
              datasets: [{
                  label: 'Task Weight',
                  data: [],
                  backgroundColor: []
              }]
          },
          options: {
              title: {
                  display: true,
                  text: 'Task Status'
              },
              responsive: false
          }
      };
      
      try {
          // query the database
          let queryData = await execute_sql_query(sql_query);
          for (let i = 0; i < queryData.length; i++){
                 sampleData['data']['labels'].push(queryData[i]['name']);
                 sampleData['data']['datasets'][0]['data'].push(queryData[i]['weight']);
           }
          sampleData['data']['datasets'][0]['backgroundColor'] = generateHexColors(queryData.length);
          console.log("task_weight_breakdown_request has waited for sql query and got back this many rows", queryData.length);
          return {'title': title, 'sampleData': sampleData};
      } catch (error) {
          console.error('Error executing SQL query:', error);
          // Handle the error here
      }

      
      
      return {'title': title, 'sampleData': sampleData};
}


module.exports = {valid_request, authorised, data_to_chart, task_status_request, num_projects_request, num_tasks_request, deadlines_met_request, weekly_completion_request, member_projects_request, task_weight_breakdown_request};
