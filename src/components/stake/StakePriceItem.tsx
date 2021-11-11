import Image from 'next/image'
import { formatNumberWithCommasAsThousandsSerperator } from 'utils'

type Props = {
  title: string
  price: string
  tokenName: string
  className?: string
}

const StakePriceItem = ({ title, price, tokenName, className }: Props) => {
  return (
    <div className={className}>
      <div className="mb-4 text-2xl font-extrabold">{title}</div>
      <div className="flex items-center">
        <div className="relative w-16 h-16 mr-4">
          <Image
            src={title === 'Balance' ? '/ximo-logo.png' : '/imo-logo.png'}
            alt="token"
            layout="fill"
            objectFit="contain"
            className="rounded-md"
          />
        </div>
        <div>
          <div className="font-extrabold">
            {formatNumberWithCommasAsThousandsSerperator(
              parseFloat(price).toFixed()
            )}
          </div>
          <div>{tokenName}</div>
        </div>
      </div>
    </div>
  )
}

export default StakePriceItem
