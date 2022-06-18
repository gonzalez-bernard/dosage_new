
/** @type {[number,number][]} */
var new_data = [[1.5, 30], [2.3, 40], [5, 35], [3, 50], [5, 49], [6, 60], [7, 70], [8, 91]]
var data = [[4, 30], [2, 40], [3, 35], [4, 50], [5, 49], [6, 60], [11, 70], [8, 91]]

var new_options = {
  xAxis: {
    title: {
      text: 'new',
    },
    min: 0,
    max: 8,
    tickAmount: 8,
    type: 'numeric'
  }
}

/**
 * 
 * @param {[number,number][]} new_data 
 */
function update(new_data) {
  chart.hideSeries('B')
  /*
  chart.updateSeries([{
    data: new_data,
  }])
  chart.updateOptions(new_options)
  */
}

var options = {
  chart: {
    type: 'scatter',
    animations: {
      enabled: true,
      speed: 10,
      animateGradually: {
        enabled: true,
        delay: 100
      }
    },

    events: {

      click: function (e, context, config) {
        console.log(e)
        console.log(context)
        console.log(config)
        update(new_data)
      }

    }
  },
  series: [
    {
      name: 'A',
      data: new_data
    },
    {
      name: 'B',
      data: data
    }],

  markers: {
    size: 2,
    colors: ["#FF0000", "#FF0000"]
  },
  xAxis: {
    title: {
      text: 'abs...',
    },
    min: 0,
    max: 10,
    tickAmount: 10,
    type: 'numeric'
  },
  yAxis: [
    {
      seriesName: 'A',
      title: {
        text: 'one'
      }
    },
    {
      seriesName: 'B',
      opposite: true,
      title: {
        text: 'two',
      }
    }
  ],
  grid: {
    position: 'front',
    xAxis: {
      lines: {
        show: true,
      },
      type: 'numeric'
    },
    yAxis: {
      lines: {
        show: true,
      },
    }
  }
}

var chart = new ApexCharts(document.getElementById("chart"), options);

chart.render();