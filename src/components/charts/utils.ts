import { TIME_PERIODS } from './constants'

export const getTimePeriod = (chartFromTs, chartDurationSeconds) => {
  const timePeriod = chartDurationSeconds / TIME_PERIODS

  const timePeriodArray = new Array(TIME_PERIODS)
    .fill('')
    .map((_, index) => chartFromTs + index * timePeriod)

  return timePeriodArray
}

export const getMinMax = (yAxe) => {
  let min = Math.min(...yAxe)
  let max = Math.max(...yAxe)

  if (min === max) {
    min = 0.0
    max = max * 2.0
  }

  return {
    min,
    max,
  }
}

export const getAxes = (chartData, timePeriodArray, chartFromTs) => {
  let valueBeforeTime = 0

  chartData.forEach((item) => {
    if (chartFromTs >= item[0]) {
      valueBeforeTime = item[1]
    }
  })

  const now = Math.floor(Date.now() / 1000)

  const resultData = timePeriodArray.reduce((accumulator, currentValue, i) => {
    let value = [currentValue, valueBeforeTime]
    let foundMatch = false
    chartData.forEach((item) => {
      const [timestamp, price] = item

      const isBetweenTimePeriod =
        timestamp > timePeriodArray[i] &&
        timestamp <= (timePeriodArray[i + 1] || now)

      if (isBetweenTimePeriod) {
        value = [currentValue, price]
        foundMatch = true
      }
    })

    if (!foundMatch && i > 0) {
      const lastPrice = accumulator[i - 1][1]
      value = [currentValue, lastPrice]
    }

    accumulator.push(value)

    return accumulator
  }, [])

  const xAxe = resultData.map((item) => item[0])
  const yAxe = resultData.map((item) => item[1])

  return { xAxe, yAxe }
}
