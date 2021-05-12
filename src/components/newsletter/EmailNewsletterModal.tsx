import { useContext } from 'react'
import { GlobalContext } from '../../pages/_app'
import { Modal } from '..'
import { useTheme } from 'next-themes'
export default function EmailNewsletterModal() {
  const {
    isEmailNewsletterModalOpen,
    setIsEmailNewsletterModalOpen,
  } = useContext(GlobalContext)
  const { theme } = useTheme()
  return (
    <Modal
      isOpen={isEmailNewsletterModalOpen}
      close={() => {
        setIsEmailNewsletterModalOpen(false)
      }}
    >
      <div className="mb-5 w-100 max-w-100">
        <div className="p-4 bg-top-mobile">
          <p className="text-2xl text-center text-gray-300 md:text-3xl font-gilroy-bold">
            Notifications
          </p>
        </div>
        <div className="flex justify-center bg-gray-700">
          <iframe
            src="https://ideamarkets.substack.com/embed"
            width="350"
            height="320"
            style={{
              border: '1px solid #EEE',
              backgroundColor: theme === 'dark' ? '#374151' : 'white',
            }}
            frameBorder="0"
            scrolling="no"
            title="substack"
          />
        </div>
      </div>
    </Modal>
  )
}
