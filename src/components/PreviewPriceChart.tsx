import { useMemo, useRef, useEffect } from 'react'
import Chart from 'chart.js'

export default function PreviewPriceChart({ chartData }) {
  const labels = useMemo(() => chartData.map((pair) => parseFloat(pair[0])), [])

  const data = useMemo(() => chartData.map((pair) => parseFloat(pair[1])), [])

  const ref = useRef(null)

  useEffect(() => {
    let min = Math.min(...data)
    let max = Math.max(...data)

    if (min === max) {
      min = 0.0
      max = max * 2.0
    }

    new Chart(ref.current.getContext('2d'), {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            pointRadius: 0,
            fill: false,
            borderColor: '#0857e0',
            borderWidth: 1.5,
            lineTension: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: false,
        },
        scales: {
          xAxes: [
            {
              ticks: { display: false },
              gridLines: { display: false },
            },
          ],
          yAxes: [
            {
              ticks: {
                display: false,
                min: min,
                max: max,
              },
              gridLines: { display: false },
            },
          ],
        },
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
  }, [labels, data])

  return (
    <div className="h-10 max-w-xs max-h-10">
      <canvas ref={ref} className="h-10 max-w-xs max-h-10"></canvas>
    </div>
  )
}
