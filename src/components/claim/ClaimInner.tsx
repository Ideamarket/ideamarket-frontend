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
    <div className="flex flex-col flex-grow font-gilroy-bold pl-10 pr-10 lg:pl-32 lg:pr-24 pt-20 md:pt-0">
      <div className="flex m-auto w-full flex-col md:flex-row w-full lg:w-11/12">
        <div className="flex flex-col m-auto ml-0 text-black max-w-3xl pr-0 md:pr-8">
          <div className="flex items-center text-3xl md:text-4xl font-extrabold  opacity-75 relative pt-12 md:pt-6 pb-6">
            Introducing $IMO
            <div className="rounded-full background-white ml-2 shadow w-8 h-8 md:w-10 md:h-10 p-1">
              <div className="flex-grow-0 w-6 h-6 md:w-8 md:h-8 relative">
                <Image
                  src="/logo.png"
                  alt="Workflow logo"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            </div>
          </div>
          <div className="text-5xl md:text-6xl font-extrabold opacity-75">
            Lorem ipsum dolor sit amet, consectetur
          </div>
          <div className="my-16 text-sm md:text-base font-normal opacity-75 max-w-2xl">
            Dui elit sollicitudin cursus mi scelerisque. Sit urna felis id quis
            egestas dictum mauris. Placerat enim lacus tincidunt viverra
            pharetra, sed vestibulum at pellentesque.
          </div>
          <Link href="/claim-dashboard">
            <div
              className="hidden md:flex flex-col text-center my-6 rounded-lg hover:bg-blue-800 w-full max-w-xs py-4 text-white bg-blue-600 cursor-pointer"
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
              <Accordion title={data.title} body={data.body} key={data.title} />
            ))}
            <span className="text-sm font-light ml-auto mr-auto md:mr-0 my-4 underline opacity-80 flex items-end cursor-pointer">
              Ideamarket Token Overview
              <ExternalLinkIcon className="h-full inline ml-2" />
            </span>
            <Link href="/claim-dashboard">
              <div
                className="flex md:hidden flex-col text-center my-8 rounded-lg hover:bg-blue-800 w-full w-max-26 py-4 text-white bg-blue-600 cursor-pointer"
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
  )
}

export default ClaimInner
