// functions defined here will be used in index.js
// database credentials are specified in a .env file stored within the same package on the remote machine
// check authorised() for an example of how to query the database and process the results

const mysql = require('mysql');
require('dotenv').config();

const dataChartDict = {
      'weekly-task-completion': 'line',
      'deadlines-met': 'progressBar',
      'task-status-proportions': 'progressBar',
      'num-projects': 'stat',
      'member-projects': 'list',
      'task-weight-breakdown': 'pie',
      'num-tasks': 'stat',
      'employee-role': 'role'
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

async function task_status_request(targetId){
  const title = 'Status of Current Tasks';
  let sampleData = [];
  // query the database
  
  sampleData = {'Complete': 3,
        'In Progress': 1,
        'Overdue': 2};
  let sql_query = `SELECT COUNT(*) as Tasks
      FROM task 
      INNER JOIN task_complete ON task.id = task_complete.task_id 
      WHERE deadline > STR_TO_DATE('2024-05-17 13:42:04', '%Y-%m-%d %H:%i:%s') AND assigned_user_id = ${targetId} 
      UNION ALL SELECT COUNT(*) as Tasks
      FROM task 
      INNER JOIN task_start ON task.id = task_start.task_id 
      LEFT JOIN task_complete ON task.id = task_complete.task_id 
      WHERE task_complete.task_id IS NULL AND deadline > STR_TO_DATE('2024-05-17 13:42:04', '%Y-%m-%d %H:%i:%s') AND assigned_user_id = ${targetId} 
      UNION ALL SELECT COUNT(*) AS Task 
      FROM task 
      LEFT JOIN task_complete 
      ON task.id = task_complete.task_id 
      WHERE task.assigned_user_id = ${targetId} 
      AND (task_complete.complete_date > task.deadline OR task_complete.complete_date IS NULL) 
      AND task.deadline >= DATE_SUB('2024-05-17 13:42:04', INTERVAL 7 DAY); ;`;
  try {
    // query the database
    let queryData = await execute_sql_query(sql_query);
    if (queryData.length > 0){
      sampleData["Complete"] = queryData[0]["Tasks"];
      sampleData["In Progress"] = queryData[1]["Tasks"];
      sampleData["Overdue"] = queryData[2]["Tasks"];
    } 
      
    return {'title': title, 'sampleData': sampleData};
  } catch (error) {
    console.error('Error executing SQL query:', error);
    // Handle the error here
  }
  
}


async function num_projects_request(targetId){
  const title = 'Number of Current Projects';
  let sql_query = `SELECT COUNT(p.id) AS Projects FROM project_team_member ptm 
      JOIN project p ON ptm.project_id = p.id 
      WHERE ptm.user_id = 1`;
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

async function num_tasks_request(targetId){
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


function deadlines_met_request(targetId){
  const title = 'Number of Deadlines Met';
  let sampleData = [
    ['Deadlines Met', 5],
    ['Total Tasks', 6]
  ];
  // could instead use a json format depending on output required for frontend
  return {'title': title, 'sampleData': sampleData};
}
// Assuming dateStr is in the format "yyyy-m" (e.g., "2024-5")
function getMonthFromDateStr(dateStr) {
    // Split the date string into year and month parts
    const [year, month] = dateStr.split('-');
    
    // Create a new Date object with the given year and month (subtracting 1 from month since months are zero-based)
    const date = new Date(parseInt(year), parseInt(month) - 1);
    
    // Get the month from the date object (0-indexed)
    const monthIndex = date.getMonth();
    
    // Convert the month index to month name
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = months[monthIndex];
    
    return monthName;
}

async function weekly_completion_request(targetId){
  const sampleData = {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Performance',
                data: [],
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
  const sql_query = `SELECT CONCAT(
        YEAR(task_complete.complete_date),'-', 
        MONTH(task_complete.complete_date)) AS Month, 
        SUM(task.weight) AS TotalWeight 
        FROM task_complete 
        INNER JOIN task ON task_complete.task_id = task.id 
        WHERE task.assigned_user_id = ${targetId} 
        GROUP BY CONCAT(YEAR(task_complete.complete_date), '-', 
        MONTH(task_complete.complete_date)
      );`;
  try {
    // query the database
    let queryData = await execute_sql_query(sql_query);
    if (queryData.length < 1){
          for (let i = 5; i < 0; i --){
                queryData.append({"Month":  `2024-${i}`,  "TotalWeight": 0 });
          }
    }
    if (queryData.length == 1){
          for (let i = 4; i < 0; i --){
                queryData.append({"Month":  `2024-${i}`,  "TotalWeight": 0 });
          }
    }
   console.log("queryData", queryData);
    for (let i = 0; i < queryData.length; i++){
           sampleData['data']['labels'].push(getMonthFromDateStr(queryData[i]['Month']));
           sampleData['data']['datasets'][0]['data'].push(queryData[i]['TotalWeight']);
     }
    // plot data from earliest to most recent
    sampleData['data']['labels'].reverse();
    sampleData['data']['datasets'][0]['data'].reverse();
      
    console.log("weekly_completion_request has waited for sql query and got back this many rows", queryData.length);
    return {'title': title, 'sampleData': sampleData};
  } catch (error) {
          console.error('Error executing SQL query:', error);
          // Handle the error here
      }
  
}

async function member_projects_request(targetId){
  // returns a list of objects representing the projects that the individual is currently in
// returns a list of objects representing the projects that the individual is currently in
  const title = 'Projects Leading';
  let sampleData;
  // query the database
  let query_all_projects = `SELECT p.id, p.name 
      FROM project_team_member ptm 
      JOIN project p ON ptm.project_id = p.id; `;
  let query_projects_in = `SELECT p.id, p.name 
      FROM project_team_member ptm 
      JOIN project p ON ptm.project_id = p.id 
      WHERE ptm.user_id = ${targetId};`;
  let roleQuery = `SELECT DISTINCT 
    CASE  
        WHEN p.lead_id IS NOT NULL THEN 'Project Leader' 
        ELSE u.role  
    END AS role 
FROM user u 
LEFT JOIN project p ON u.id = p.lead_id 
WHERE u.id = 1`; 
  let query2;
  try {
    // query the database
    let roleQueryData = await execute_sql_query(roleQuery);
      console.log("manaher?", roleQueryData[0]["role"] );
    if (roleQueryData[0]["role"] == "Manager"){
      //a manager
      query2 = query_all_projects;
    } else { // maybe a leader
      query2 = query_projects_in;
    }
    
    try {
          // query the database
          let queryData2 = await execute_sql_query(query2);
          sampleData = queryData2;
          return {'title': title, 'sampleData': sampleData};
        } catch (error) {
          console.error('Error executing SQL query:', error);
          // Handle the error here
        }
          
      } catch (error) {
          console.error('Error executing SQL query:', error);
          // Handle the error here
      }
  
  
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
          type: 'doughnut',
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

async function employee_role_request(targetId){
      const title = 'Role of Current User';
  let sql_query = `SELECT DISTINCT 
          CASE  
              WHEN p.lead_id IS NOT NULL THEN 'Project Leader' 
              ELSE u.role  
          END AS role 
      FROM user u 
      LEFT JOIN project p ON u.id = p.lead_id 
      WHERE u.id = ${targetId}; `;
  let sampleData = "";
  try {
    // query the database
    let queryData = await execute_sql_query(sql_query);
    sampleData = queryData[0]['role'];
      console.log("num_projects has waited for sql query and got back this many rows", queryData.length);
    return {'title': title, 'sampleData': sampleData};
  } catch (error) {
    console.error('Error executing SQL query:', error);
    // Handle the error here
  }
  
}





module.exports = {valid_request, authorised, data_to_chart, task_status_request, num_projects_request, num_tasks_request, deadlines_met_request, weekly_completion_request, member_projects_request, task_weight_breakdown_request, employee_role_request};
