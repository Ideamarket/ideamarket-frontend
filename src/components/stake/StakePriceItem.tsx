import Image from 'next/image'
import { formatNumbertoLocaleString } from 'utils'

type Props = {
  title: string
  price: string
  tokenName: string
  className?: string
}

const StakePriceItem = ({ title, price, tokenName, className }: Props) => {
  let src = '/imo-logo.png'
  if (tokenName === 'xIMO') src = '/ximo-logo.png'
  else if (tokenName === 'IMO-ETH') src = '/ximo-eth-logo.png'

  return (
    <div className={className}>
      <div className="mb-4 text-lg font-medium">{title}</div>
      <div className="flex items-center">
        <div className="relative w-16 h-16 mr-4">
          <Image
            src={src}
            alt="token"
            layout="fill"
            objectFit="contain"
            className="rounded-md"
          />
        </div>
        <div>
          <div className="font-extrabold">
            {formatNumbertoLocaleString(parseFloat(price))}
          </div>
          <div>{tokenName}</div>
        </div>
      </div>
    </div>
  )
}

export default StakePriceItem
