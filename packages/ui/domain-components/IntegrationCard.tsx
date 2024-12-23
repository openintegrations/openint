import {Plus} from 'lucide-react'
import {useState} from 'react'
import {Card, CardContent} from '../shadcn'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../shadcn/Tooltip'

export function IntegrationCard({
  logo,
  name,
  onClick,
}: {
  logo: string
  name: string
  onClick: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="flex h-full flex-col items-center justify-center">
          <Card
            className="border-card-border relative h-[150px] w-[150px] cursor-pointer rounded-lg border bg-card p-0 transition-colors duration-300 ease-in-out hover:border-button hover:bg-button-light"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}>
            <CardContent
              className="flex h-full flex-col items-center justify-center py-4"
              onClick={onClick}>
              {isHovered ? (
                <div className="flex h-full flex-col items-center justify-center">
                  <Plus className="text-button" size={24} />
                  <span className="mt-2 font-sans text-[14px] font-semibold text-button">
                    Add
                  </span>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center">
                  <img
                    src={logo}
                    alt={`${name} logo`}
                    className="h-12 w-12 rounded-xl"
                    style={{marginBottom: '10px', objectFit: 'contain'}}
                  />{' '}
                  <p
                    className={`m-0 max-w-[100px] text-center text-sm font-semibold hover:text-button ${
                      name.length > 15 ? 'truncate' : ''
                    }`}>
                    {name}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          {name.charAt(0).toUpperCase() + name.slice(1)}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
