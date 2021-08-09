import { useEffect, useRef } from 'react'
import Chart from 'chart.js'
import { getAxes, getMinMax, getTimePeriod } from './utils'

export default function TimeXFloatYChartInLine({
  chartData,
  chartFromTs,
  chartDurationSeconds,
}) {
  const ref = useRef(null)

  useEffect(() => {
    const timePeriodArray = getTimePeriod(chartFromTs, chartDurationSeconds)

    const { xAxe, yAxe } = getAxes(chartData, timePeriodArray, chartFromTs)

    const { min, max } = getMinMax(yAxe)

    new Chart(ref.current.getContext('2d'), {
      type: 'line',
      data: {
        labels: xAxe,
        datasets: [
          {
            data: yAxe,
            pointRadius: 0,
            fill: false,
            borderColor: '#08a2dd',
            borderWidth: 3,
            lineTension: 0.25,
          },
        ],
      },
      options: {
        animation: {
          duration: 0,
        },
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: false,
        },
        scales: {
          xAxes: [
            {
              // type: 'time',
              display: false,
              ticks: {
                display: false,
              },
              gridLines: { display: false, drawBorder: false },
            },
          ],
          yAxes: [
            {
              ticks: {
                display: false,
                min: min - max * 0.01,
                max: max + max * 0.01,
              },
              gridLines: { display: false, drawBorder: false },
            },
          ],
        },
        /*tooltips: {
          enabled: true,
          mode: 'nearest',
          intersect: false,
        },*/
        layout: {
          padding: {
            left: 0,
            right: 0,
            top: 7,
            bottom: 0,
          },
        },
      },
    })
    // ref.current.style.height = '100px'
  }, [chartData, chartDurationSeconds, chartFromTs])

  return (
    <div
      className="flex-grow"
      style={{ position: 'relative', height: '80px', width: '100%' }}
    >
      <canvas ref={ref}></canvas>
    </div>
  )
}
