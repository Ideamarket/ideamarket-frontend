import Link from 'next/link'
import Image from 'next/image'
import { Accordion } from './Accordion'

import ExternalLinkIcon from '../../assets/external-link.svg'

const ClaimInner = () => {
  const accordionData = [
    {
      title: 'What is Ideamarket?',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Velcongue nibh scelerisque cursus enim.',
    },
    {
      title: 'Why did we launch a token?',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Velcongue nibh scelerisque cursus enim.',
    },
    {
      title: 'Why now?',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Velcongue nibh scelerisque cursus enim.',
    },
    {
      title: 'How will $IMO be distributed?',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Velcongue nibh scelerisque cursus enim.',
    },
  ]

  return (
    <div className="w-11/12 mx-auto my-0 pt-24 md:pt-4 font-gilroy-bold w-90">
      <div className="flex flex-col items-start justify-center p-4 lg:p-18 rounded-lg md:pb-32 md:flex-row dark:bg-gray-500">
        <div className="grid-cols-1 md:grid md:grid-cols-2 md:gap-8 w-full">
          <div className="mb-8 md:mb-0 text-black">
            <div className="flex items-center text-4xl font-extrabold  opacity-75 relative pt-12 md:pt-6 pb-6">
              Introducing $IMO
              <div
                className="rounded-full background-white ml-2 shadow"
                style={{
                  width: 43,
                  height: 41,
                  padding: 3,
                }}
              >
                <div className="relative">
                  <Image
                    src="/logo.png"
                    alt="Workflow logo"
                    width={37}
                    height={35}
                  />
                </div>
              </div>
            </div>
            <div className="text-6xl font-extrabold opacity-75">
              Lorem ipsum dolor sit amet, consectetur
            </div>
            <div className="my-16 text-base font-normal opacity-75">
              Dui elit sollicitudin cursus mi scelerisque. Sit urna felis id
              quis egestas dictum mauris. Placerat enim lacus tincidunt viverra
              pharetra, sed vestibulum at pellentesque.
            </div>
            <Link href="/claim-dashboard">
              <div
                className="hidden md:flex flex-col w-max text-center my-6 rounded-lg hover:bg-blue-800 px-30 py-4 text-white bg-blue-600 cursor-pointer"
                // TODO
                style={{
                  backgroundImage: `linear-gradient(135deg, #0E8FFF , #2345C3)`,
                  fontFamily: 'Segoe UI',
                }}
              >
                <div className="text-xl font-bold uppercase">Get Started</div>
                <div className="text-xs font-light">Est time : 2 mins</div>
              </div>
            </Link>
          </div>
          <div>
            <div
              className="flex items-center justify-center h-full flex-col md:w-80 w-full md:ml-auto md:mr-0 lg:mr-auto"
              // TODO
              style={{
                fontFamily: 'Segoe UI',
              }}
            >
              <span className="text-sm font-light my-4 text-left mr-auto ml-2">
                Lets get some questions out of the way...
              </span>
              {accordionData.map((data) => (
                <Accordion
                  title={data.title}
                  body={data.body}
                  key={data.title}
                />
              ))}
              <span className="text-sm font-light ml-auto mr-auto md:mr-0 my-4 underline opacity-80 flex items-end cursor-pointer">
                Ideamarket Token Overview
                <ExternalLinkIcon className="h-full inline ml-2" />
              </span>
              <Link href="/claim-dashboard">
                <div
                  className="flex md:hidden flex-col w-max text-center my-6 rounded-lg hover:bg-blue-800 px-30 py-4 text-white bg-blue-600 cursor-pointer"
                  // TODO
                  style={{
                    backgroundImage: `linear-gradient(135deg, #0E8FFF , #2345C3)`,
                    fontFamily: 'Segoe UI',
                  }}
                >
                  <div className="text-xl font-bold uppercase">Get Started</div>
                  <div className="text-xs font-light">Est time : 2 mins</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClaimInner
