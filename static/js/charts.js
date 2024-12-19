let chart;
let sensorCharts = {};
const maxDataPoints = 50;
let startTime = null;
let elapsedTime = 0;
let datasets = [];

function updateElapsedTime() {
  if (startTime === null) {
    startTime = Date.now();
  }
  elapsedTime = (Date.now() - startTime) / 1000;
}

function formatTime(seconds) {
  return seconds.toFixed(2);
}

function getRandomColor() {
  return `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
}

function initChart() {
  const ctx = document.getElementById('realTimeChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: []
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          title: {
            display: true,
            text: 'Temps'
          }
        },
        y: {
          type: 'linear',
          position: 'left',
          title: {
            display: true,
            text: 'Valeur'
          }
        }
      },
      plugins: {
        zoom: {
          zoom: {
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true
            },
            mode: 'xy',
          },
          pan: {
            enabled: true,
            mode: 'xy',
          }
        }
      }
    }
  });
}

function updateChart(patientId, data, selectedSensors) {
  updateElapsedTime();

  selectedSensors.forEach((sensor, index) => {
    const datasetIndex = datasets.findIndex(ds => ds.patientId === patientId && ds.sensor === sensor);
    if (datasetIndex === -1) {
      // Ajouter un nouveau dataset si nécessaire
      const newDataset = {
        label: `Patient ${patientId} - ${sensorTypes[sensor].name}`,
        data: [{x: elapsedTime, y: parseFloat(data[index])}],
        borderColor: getRandomColor(),
        fill: false,
        patientId: patientId,
        sensor: sensor
      };
      datasets.push(newDataset);
      chart.data.datasets.push(newDataset);
    } else {
      // Mettre à jour le dataset existant
      datasets[datasetIndex].data.push({x: elapsedTime, y: parseFloat(data[index])});
      if (datasets[datasetIndex].data.length > maxDataPoints) {
        datasets[datasetIndex].data.shift();
      }
    }
  });

  // Supprimer les datasets des capteurs non sélectionnés
  datasets = datasets.filter(ds => {
    if (ds.patientId === patientId && !selectedSensors.includes(ds.sensor)) {
      const index = chart.data.datasets.findIndex(chartDs => chartDs.patientId === ds.patientId && chartDs.sensor === ds.sensor);
      if (index !== -1) {
        chart.data.datasets.splice(index, 1);
      }
      return false;
    }
    return true;
  });

  // Mettre à jour le graphique de manière asynchrone
  requestAnimationFrame(() => {
    chart.update();
  });

  // Mettre à jour les graphiques par capteur
  updateSensorCharts(patientId, data, selectedSensors);
}

function initSensorCharts() {
  const container = document.getElementById('sensorChartsContainer');
  container.innerHTML = '';

  const sensorOrder = ['alx', 'aly', 'alz', 'glx', 'gly', 'glz', 'arx', 'ary', 'arz', 'grx', 'gry', 'grz']

  sensorOrder.forEach((sensor, index) => {
    const chartDiv = document.createElement('div');
    chartDiv.className = 'sensor-chart';
    chartDiv.id = `chart-${sensor}`;
    chartDiv.style.gridColumn = `${Math.floor(index / 3) + 1}`;
    chartDiv.style.gridRow = `${(index % 3) + 1}`;
    container.appendChild(chartDiv);

    const canvas = document.createElement('canvas');
    chartDiv.appendChild(canvas);

    sensorCharts[sensor] = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        datasets: []
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          title: {
            display: true,
            text: `${sensorTypes[sensor].name} (${sensor})`,
            font: {
              size: 14
            }
          },
          legend: {
            display: true,
            position: 'top',
            labels: {
              boxWidth: 10
            }
          },
          // zoom: {
          //     zoom: {
          //         wheel: {
          //             enabled: true,
          //         },
          //         pinch: {
          //             enabled: true
          //         },
          //         mode: 'xy',
          //     },
          //     pan: {
          //         enabled: true,
          //         mode: 'xy',
          //     }
          // }
        },
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            title: {
              display: true,
              text: 'Temps (s)',
              font: {
                size: 10
              }
            }
          },
          y: {
            type: 'linear',
            position: 'left',
            title: {
              display: true,
              text: 'Valeur',
              font: {
                size: 10
              }
            }
          }
        }
      }
    });
  });
}

function updateSensorCharts(patientId, data, selectedSensors) {
  updateElapsedTime();

  selectedSensors.forEach((sensor, index) => {
    const chart = sensorCharts[sensor];
    if (!chart) return;

    const datasetIndex = chart.data.datasets.findIndex(ds => ds.patientId === patientId);
    if (datasetIndex === -1) {
      // Ajouter un nouveau dataset si nécessaire
      const newDataset = {
        label: `Patient ${patientId}`,
        data: [{x: elapsedTime, y: parseFloat(data[index])}],
        borderColor: getRandomColor(),
        fill: false,
        patientId: patientId
      };
      chart.data.datasets.push(newDataset);
    } else {
      // Mettre à jour le dataset existant
      chart.data.datasets[datasetIndex].data.push({x: elapsedTime, y: parseFloat(data[index])});
      if (chart.data.datasets[datasetIndex].data.length > maxDataPoints) {
        chart.data.datasets[datasetIndex].data.shift();
      }
    }
  });

  // Mettre à jour les graphiques de manière asynchrone
  requestAnimationFrame(() => {
    Object.values(sensorCharts).forEach(chart => chart.update());
  });
}
