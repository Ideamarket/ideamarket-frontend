import Image from 'next/image'

interface Props {
  data: any
}

export const BreakdownPointCard: React.FC<Props> = ({ data }) => {
  const length = data.amount.filter((amount) => amount).length
  return (
    <div
      className="bg-white/5 backdrop-blur-3xl border bg-opacity-50 py-5 px-6 rounded-2xl flex justify-between my-2 w-full items-center"
      role="alert"
    >
      <span className="w-max mr-2 opacity-70">{data.text}</span>
      <div className="flex flex-col">
        {data.amount.map(
          (amount, idx) =>
            Boolean((idx === 0 && length === 0) || amount) && (
              <div className="flex my-1 items-center" key={idx}>
                <span className="bg-gradient-to-r bg-clip-text from-brand-blue-1 to-brand-blue-2 font-black text-transparent">
                  {amount}
                </span>

                <div className="ml-2 p-1 w-6 h-6 inline-block rounded-full bg-white shadow">
                  <div className="relative w-4 h-4">
                    <Image
                      src="/logo.png"
                      alt="Workflow logo"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                </div>
              </div>
            )
        )}
      </div>
    </div>
  )
}
