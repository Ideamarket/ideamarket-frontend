import { Chart } from 'chart.js'
import { useEffect, useRef, useState } from 'react'
import { useMutation } from 'react-query'
import moment from 'moment'

type Props = {
  rawTokenName: string
  title: string
}

export default function PageViewsPanel({ rawTokenName, title }: Props) {
  const [data, setData] = useState({
    counts: [],
    dates: [],
  })
  const [fetchTrends] = useMutation<{
    message: string
    data: any
  }>(() =>
    // sun will be replaced with rawTokenName
    fetch(`/api/markets/wikipedia/pageViews?title=Sun`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(async (res) => {
      if (!res.ok) {
        const response = await res.json()
        throw new Error(response.message)
      }
      return res.json()
    })
  )

  useEffect(() => {
    fetchTrends().then(({ data }) => {
      const dates = data.pageViews.map((item) =>
        moment.utc(item.date, 'YYYY-MM-DD').format('MMM Do, YYYY')
      )
      const counts = data.pageViews.map((item) => item.count)
      setData({ dates, counts })
    })
  }, [fetchTrends])

  const ref = useRef(null)
  const [chart, setChart] = useState(null)

  useEffect(() => {
    if (chart) {
      chart.destroy()
    }

    setChart(
      new Chart(ref.current.getContext('2d'), {
        type: 'line',
        data: {
          labels: data?.dates,
          datasets: [
            {
              data: data?.counts,
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
                display: true,
                ticks: {
                  display: true,
                  maxTicksLimit: 10,
                  autoSkip: true,
                },
                gridLines: { display: false, drawBorder: false },
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
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])
  return (
    <div className="h-full p-5 bg-white border rounded-md dark:bg-gray-700 dark:border-gray-500 border-brand-border-gray">
      <div className="pb-4 text-2xl text-center">{title}</div>
      <div className="relative">
        <div
          className="flex-grow"
          style={{
            position: 'relative',
            height: '250px',
            width: '100%',
            contain: 'content',
          }}
        >
          <canvas
            ref={ref}
            style={{ display: 'block', width: '100%' }}
          ></canvas>
        </div>
      </div>
    </div>
  )
}
