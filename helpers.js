
const dataChartDict = {
      'weekly-task-completion': 'line',
      'deadlines-met': 'progressBar',
      'task-status-proportions': 'pie',
      'performance-report': 'stat',
      'num-projects': 'stat'
  };

const listDataAbout = ['self', 'project', 'avg-employee'];


function valid_request(data_requested, client_token, data_about, target_id){
  if (Object.keys(dataChartDict).includes(data_requested) === false){
        return false;
  }
  if (client_token == ''){
        return false;
  }
  if (listDataAbout.includes(data_about) === false){
        return false;
  }
  if (data_about == 'avg-employee'){
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

function authorised(){
  return true;
}

function data_to_chart(data_requested){
  
  // -- matches dataRequest to a chart type
  // -- dataToChart = [weekly-task-completion: 'line', deadlines-met: 'progressBar', task-status-proportions: 'pie', performance-report: 'stat', num-projects: 'stat'];
  const chart = dataChartDict[data_requested];
  return chart;
}








module.exports = {valid_request, authorised, data_to_chart};
