import Cal, {getCalApi} from '@calcom/embed-react'
import {X} from 'lucide-react'
import {useEffect} from 'react'
import {Button} from '../shadcn/Button'

interface CalendarBookingProps {
  description: string
  header: string
  isVisible: boolean
  onClose: () => void
  onDismiss: () => void
}

export default function CalendarBooking({
  description,
  header,
  isVisible,
  onClose,
  onDismiss,
}: CalendarBookingProps) {
  useEffect(() => {
    if (isVisible) {
      void (async function () {
        try {
          const cal = await getCalApi({namespace: 'discovery'})
          cal('ui', {
            hideEventTypeDetails: false,
            layout: 'month_view',
            styles: {branding: {brandColor: '#000000'}},
          })
        } catch (error) {
          console.error('Failed to initialize calendar:', error)
        }
      })()
    }
  }, [isVisible])

  return isVisible ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center border border-gray-200 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-xl">
        <button
          className="absolute right-2 top-2 text-gray-400"
          onClick={onClose}>
          <X size={24} />
        </button>
        <h2 className="mb-4 text-xl font-bold">{header}</h2>
        <p className="mb-4">{description}</p>
        <div className="mb-4 h-[700px] overflow-auto rounded border border-gray-100">
          <Cal
            calLink="ap-openint/discovery"
            config={{layout: 'month_view'}}
            namespace="discovery"
            style={{height: '100%', width: '100%'}}
          />
        </div>
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onDismiss}>
            Not right now
          </Button>
        </div>
      </div>
    </div>
  ) : null
}
