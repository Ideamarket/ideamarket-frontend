import Image from 'next/image'
import copy from 'copy-to-clipboard'
import { MinusCircleIcon } from '@heroicons/react/outline'
import { BadgeCheckIcon } from '@heroicons/react/solid'

const EthAddressSwitcher = ({ ethAddresses, removeAddress }) => {
  return (
    <div>
      {ethAddresses?.map((ethAddress, index) => (
        <div className="flex items-center" key={index}>
          {ethAddress.verified ? (
            <BadgeCheckIcon className="flex-shrink-0 w-5 h-5" />
          ) : (
            <div className="w-5 h-5"></div>
          )}
          {ethAddresses.length > 1 && (
            <div className="relative w-4 h-4 ml-2">
              <Image
                src={`/${index + 1}Emoji.png`}
                alt="address-number"
                layout="fill"
                objectFit="contain"
              />
            </div>
          )}
          <p
            key={`${ethAddress.address}-${index}`}
            onClick={() => copy(ethAddress.address)}
            className="ml-2"
          >
            {ethAddress.address?.substr(
              0,
              ethAddress.address?.length > 16 ? 16 : ethAddress.address?.length
            ) + (ethAddress.address?.length > 16 ? '...' : '')}
          </p>
          <MinusCircleIcon
            onClick={() => removeAddress(ethAddress.address)}
            className="flex-shrink-0 w-5 h-5 ml-auto cursor-pointer"
          />
        </div>
      ))}
    </div>
  )
}

export default EthAddressSwitcher
