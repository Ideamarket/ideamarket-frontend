import { getLockingAPR } from 'lib/axios'
import { GlobalContext } from 'pages/_app'
import { useContext, useEffect, useState } from 'react'
import { TiDeleteOutline } from 'react-icons/ti'
import { formatNumber } from 'utils'

const ImoNavbarTooltip = () => {
  const { imoAdvVisibility, setImoAdvVisibility } = useContext(GlobalContext)
  const [lockingAPR, setLockingAPR] = useState(undefined)
  useEffect(() => {
    getLockingAPR()
      .then((response) => {
        const { data } = response
        if (data.success) {
          setLockingAPR(Number(data.data.apr))
        } else setLockingAPR(0)
      })
      .catch(() => setLockingAPR(0))
  }, [])

  if (!imoAdvVisibility) return <></>
  return (
    <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-max bg-brand-light-green rounded-lg p-2 flex items-center text-white text-sm leading-5">
      <span className="relative">
        upto{' '}
        <span className="font-bold">{formatNumber(lockingAPR * 1.2)}% APR</span>
      </span>
      <TiDeleteOutline
        className="w-6 h-6 ml-6 cursor-pointer"
        onClick={() => setImoAdvVisibility(false)}
      />
      <div className="absolute z-0 border-b-0 border-l-0 border-t-[20px] border-r-[20px] -top-2 text-white transform left-1/2 -translate-x-1/2  rotate-45 border-brand-light-green"></div>
    </div>
  )
}

export default ImoNavbarTooltip
