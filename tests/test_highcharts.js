  const canvas = 'container'
  const _data1 = [[ 0.5, 0.5 ], [2, 8] , [3,15]]
  const _data2 = [[ 1.5, 0.5 ], [2, 5] , [3,10]]

  // @ts-ignore
  const chart = new Highcharts.Chart(canvas,{
    chart: {
      type:'scatter'
    },
    title: {
      text: 'Essai'
    },
    xAxis:{
      gridLineWidth: 1,
      tickInterval:0.5
    },
    yAxis:{},
    legend: {},
    plotOptions:{
      scatter: {
        lineWidth: 1,
        color: '#ff2e10'
      }
    },
    series: [{
      name: 'pH',
      color: '#000',
      data: _data1
    },
    { name:'dpH',
      data:_data2
    }]
  })