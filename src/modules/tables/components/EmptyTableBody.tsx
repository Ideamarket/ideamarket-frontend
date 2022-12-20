import { ExternalLinkIcon } from '@heroicons/react/outline'
import { A } from 'components'
import Image from 'next/image'

const EmptyTableBody = () => {
  return (
    <div className="w-full h-96 pt-16 flex flex-col items-center bg-white">
      <div className="text-black/[.2] text-3xl font-gilroy-bold">
        There's nothing here... yet
      </div>

      <A
        href="https://app.sushi.com/swap?inputCurrency=ETH&outputCurrency=0xB41bd4C99dA73510d9e081C5FADBE7A27Ac1F814"
        className="mt-4 text-black underline hover:text-blue-500 cursor-pointer font-medium"
      >
        <span className="underline">Buy $IMO on SushiSwap</span>
        <ExternalLinkIcon className="w-5 inline ml-1 mb-1" />
      </A>

      <div className="relative w-2/3 h-full mt-4 mb-1">
        <Image
          src="/nothing-here.svg"
          alt="Nothing here image"
          layout="fill"
          objectFit="contain"
          className=""
        />
      </div>
    </div>
  )
}

export default EmptyTableBody
