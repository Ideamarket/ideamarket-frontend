import React from 'react'
import { DefaultLayout } from 'components'
import {
  getMarketSpecificsByMarketNameInURLRepresentation,
  getMarketSpecifics,
} from 'store/markets'
import { GetServerSideProps } from 'next'
import Home from 'pages'

export default function MarketsHome({
  marketsList,
}: {
  marketsList: string[]
}) {
  return <Home urlMarkets={marketsList} />
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { markets } = context.params

  let marketsList = (markets as string)
    .split(',')
    .map((m) => getMarketSpecificsByMarketNameInURLRepresentation(m))
    .filter((m) => m !== undefined)
    .map((m) => m.getMarketName())

  marketsList = marketsList.filter((m, pos) => {
    return marketsList.indexOf(m) === pos
  })

  if (marketsList.length === 0) {
    // Redirect to regular home page if no valid markets
    return {
      redirect: {
        destination: `/`,
        permanent: true,
      },
    }
  }

  if (marketsList.length === getMarketSpecifics().length) {
    marketsList.push('All')
  }

  return { props: { marketsList } }
}

MarketsHome.layoutProps = {
  Layout: DefaultLayout,
}
