import { useEffect, useRef } from 'react'
import Chart from 'chart.js'

export default function TimeXFloatYChart({ chartData }) {
  const ref = useRef(null)

  useEffect(() => {
    const data = chartData.map((pair) => ({
      x: new Date(Math.floor(pair[0] * 1000)),
      y: parseFloat(pair[1]),
    }))

    const ys = data.map(({ y }) => y)
    let min = Math.min(...ys)
    let max = Math.max(...ys)

    if (min === max) {
      min = 0.0
      max = max * 2.0
    }

    new Chart(ref.current.getContext('2d'), {
      type: 'line',
      data: {
        datasets: [
          {
            data: data,
            pointRadius: 0,
            fill: false,
            borderColor: '#08a2dd',
            steppedLine: true,
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
              type: 'time',
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
                min: min,
                max: max,
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
  }, [chartData])

  return (
    <div
      className="flex-grow"
      style={{ position: 'relative', height: '80px', width: '100%' }}
    >
      <canvas ref={ref}></canvas>
    </div>
  )
}
