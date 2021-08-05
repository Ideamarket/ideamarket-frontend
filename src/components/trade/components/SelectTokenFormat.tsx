import Image from 'next/image'

const SelectTokensFormat = ({ token }) => (
  <div className="flex flex-row items-center w-full">
    <div className="flex items-center">
      <div className="w-7 h-7 relative">
        <Image
          src={token?.logoURL || '/gray.svg'}
          alt="token"
          layout="fill"
          objectFit="contain"
          className="rounded-full"
        />
      </div>
    </div>
    <div className="ml-2.5 dark:text-gray-300">
      <div>{token.symbol}</div>
    </div>
  </div>
)

export default SelectTokensFormat
