'use client'

import {AlertCircle, Loader2} from 'lucide-react'
import Image from 'next/image'
import React, {useState} from 'react'
import {_trpcReact} from '@openint/engine-frontend'
import {cn} from '@openint/shadcn/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Badge,
  Button,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  useToast,
} from '@openint/shadcn/ui'
import type {SchemaFormElement} from '@openint/ui'
import {LoadingText} from '@openint/ui/components/LoadingText'
import {ConnectorConfigForm} from './ConnectorConfigForm'
import type {ConnectorConfig} from './ConnectorConfigPage'

// import {defConnectors } from '@openint/app-config/connectorss/connectorss.def'

export function ConnectorConfigSheet({
  connectorConfig: ccfg,
  connectorName,
  open,
  setOpen,
  refetch,
}: {
  connectorConfig?: Omit<ConnectorConfig, 'connectorName'>
  connectorName: string
  open: boolean
  setOpen: (open: boolean) => void
  refetch?: () => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const trpcUtils = _trpcReact.useContext()
  const connectorMetaRes = _trpcReact.getConnectorMeta.useQuery({
    name: connectorName,
  })
  const connectorMeta = connectorMetaRes.data

  const verb = ccfg ? 'Edit' : 'Add'
  const {toast} = useToast()

  const handleSuccess = React.useCallback(() => {
    setIsSubmitting(false)
    setOpen(false)
    toast.success('connector config saved')
    void trpcUtils.adminListConnectorConfigs.invalidate()
    void trpcUtils.listConnectorConfigInfos.invalidate()
    refetch?.()
  }, [setOpen, toast, trpcUtils, refetch])

  const upsertConnectorConfig =
    _trpcReact.adminUpsertConnectorConfig.useMutation({
      onSuccess: handleSuccess,
      onError: (err) => {
        setIsSubmitting(false)
        toast.error(`Failed to save connector config: ${err}`)
      },
    })
  const deleteConnectorConfig =
    _trpcReact.adminDeleteConnectorConfig.useMutation({
      onSuccess: () => {
        setOpen(false)
        toast.success('connector config deleted')
        void trpcUtils.adminListConnectorConfigs.invalidate()
        void trpcUtils.listConnectorConfigInfos.invalidate()
        refetch?.()
      },
      onError: (err) => {
        toast.error(`Failed to create connector config: ${err}`)
      },
    })
  const mutating =
    deleteConnectorConfig.isLoading || upsertConnectorConfig.isLoading

  const formRef = React.useRef<SchemaFormElement>(null)

  const connectionsRes = _trpcReact.listConnection.useQuery(
    {
      connectorConfigId: ccfg?.id,
    },
    {
      cacheTime: 0,
      staleTime: 0,
      refetchOnMount: true,
    },
  )

  const handleSubmit = () => {
    setIsSubmitting(true)
    formRef.current?.submit()
  }

  if (!connectorMeta) {
    return <LoadingText className="block p-4" />
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="bg-background flex w-[800px] flex-col sm:max-w-full">
        {isSubmitting && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50">
            <Loader2 className="text-button h-10 w-10 animate-spin" />
          </div>
        )}

        <SheetHeader className="shrink-0">
          <SheetTitle>
            {verb} {connectorMeta.displayName} connector config
          </SheetTitle>

          <div className="flex max-h-[100px] flex-row items-center justify-between">
            {connectorMeta.logoUrl ? (
              <Image
                width={100}
                height={100}
                src={connectorMeta.logoUrl}
                alt={connectorMeta.displayName}
              />
            ) : (
              <span>{connectorMeta.displayName}</span>
            )}
            <Badge
              variant="secondary"
              className={cn(
                'ml-auto',
                connectorMeta.stage === 'ga' && 'bg-green-200',
                connectorMeta.stage === 'beta' && 'bg-blue-200',
                connectorMeta.stage === 'alpha' && 'bg-pink-50',
              )}>
              {connectorMeta.stage}
            </Badge>
            {/* Add help text here */}
          </div>

          <SheetDescription>
            {ccfg && `ID: ${ccfg.id}`}
            <br />
            Supported mode(s): {connectorMeta.supportedModes.join(', ')}
          </SheetDescription>
        </SheetHeader>
        <Separator orientation="horizontal" />
        <ConnectorConfigForm
          connectorName={connectorName}
          connectorMeta={connectorMeta}
          ccfg={ccfg}
          setOpen={setOpen}
          formRef={formRef}
          isLoading={connectorMetaRes.isLoading}
        />
        <Separator orientation="horizontal" />
        <SheetFooter className="flex shrink-0 justify-between">
          {ccfg && (
            <AlertDialog>
              {(connectionsRes.data ?? []).length > 0 ? (
                <div className="mr-auto flex items-center gap-2">
                  <Button variant="destructive" disabled>
                    Delete
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <AlertCircle className="text-destructive size-6" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Cannot delete connector config while it has active
                        connections
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              ) : (
                <AlertDialogTrigger asChild>
                  <div className="mr-auto flex items-center gap-2">
                    <Button
                      variant="destructive"
                      disabled={connectionsRes.isLoading}>
                      Delete
                    </Button>
                  </div>
                </AlertDialogTrigger>
              )}
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Confirm delete {connectorMeta.displayName} connector config?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    ID: {ccfg.id}
                    <br />
                    This action cannot be undone. In order to to delete an
                    connector config, you may need to first delete all the
                    connections that depend on this connector config first
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button
                      disabled={mutating}
                      className="mr-auto"
                      // Specifying asChild and using this variant does not appear to be
                      // working for some reason...
                      variant="destructive"
                      onClick={() =>
                        deleteConnectorConfig.mutate({id: ccfg.id})
                      }>
                      {deleteConnectorConfig.isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Delete
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button
            disabled={mutating || isSubmitting}
            type="submit"
            onClick={handleSubmit}>
            {upsertConnectorConfig.isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {ccfg ? 'Save' : 'Create'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
