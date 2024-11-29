'use client'

import {Loader2} from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import {_trpcReact} from '@openint/engine-frontend'
import type {SchemaFormElement} from '@openint/ui'
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
  LoadingText,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  useToast,
} from '@openint/ui'
import {cn} from '@/lib-client/ui-utils'
import {ConnectorConfigForm} from './ConnectorConfigForm'
import type {ConnectorConfig} from './ConnectorConfigPage'

// import {defConnectors } from '@openint/app-config/connectorss/connectorss.def'

export function ConnectorConfigSheet({
  connectorConfig: ccfg,
  connectorName,
  open,
  setOpen,
}: {
  connectorConfig?: Omit<ConnectorConfig, 'connectorName'>
  connectorName: string
  open: boolean
  setOpen: (open: boolean) => void
}) {
  const trpcUtils = _trpcReact.useContext()
  const connectorMetaRes = _trpcReact.getConnectorMeta.useQuery({
    name: connectorName,
  })
  const connectorMeta = connectorMetaRes.data

  const verb = ccfg ? 'Edit' : 'Add'
  const {toast} = useToast()

  const upsertConnectorConfig =
    _trpcReact.adminUpsertConnectorConfig.useMutation({
      onSuccess: () => {
        setOpen(false)
        toast({title: 'connector config saved', variant: 'success'})
        void trpcUtils.adminListConnectorConfigs.invalidate()
        void trpcUtils.listConnectorConfigInfos.invalidate()
      },
      onError: (err) => {
        toast({
          title: 'Failed to save connector config',
          description: `${err}`,
          variant: 'destructive',
        })
      },
    })
  const deleteConnectorConfig =
    _trpcReact.adminDeleteConnectorConfig.useMutation({
      onSuccess: () => {
        setOpen(false)
        toast({title: 'connector config deleted', variant: 'success'})
        void trpcUtils.adminListConnectorConfigs.invalidate()
        void trpcUtils.listConnectorConfigInfos.invalidate()
      },
      onError: (err) => {
        toast({
          title: 'Failed to create connector config saved',
          description: `${err}`,
          variant: 'destructive',
        })
      },
    })
  const mutating =
    deleteConnectorConfig.isLoading || upsertConnectorConfig.isLoading

  const formRef = React.useRef<SchemaFormElement>(null)

  if (!connectorMeta) {
    return <LoadingText className="block p-4" />
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        position="right"
        size="lg"
        className="flex flex-col bg-background">
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
        <SheetFooter className="shrink-0">
          {ccfg && (
            <AlertDialog>
              <AlertDialogTrigger className="mr-auto">
                Delete
              </AlertDialogTrigger>
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
                    resources that depend on this connector config first
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
            disabled={mutating}
            type="submit"
            onClick={() => formRef.current?.submit()}>
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
