import Image from 'next/image'

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
            src="/gray.svg"
            alt="token"
            layout="fill"
            objectFit="contain"
            className="rounded-md"
          />
        </div>
        <div>
          <div className="font-extrabold">{price}</div>
          <div>{tokenName}</div>
        </div>
      </div>
    </div>
  )
}

export default StakePriceItem
