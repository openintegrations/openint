import type React from 'react'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {v4 as uuid} from 'uuid'
import {Spinner} from '../../components/Spinner'
import {Button} from '../../components/ui/button'
import {Checkbox} from '../../components/ui/checkbox'
import {Input} from '../../components/ui/input'
import {ScrollArea} from '../../components/ui/scroll-area'
import {persistSelectedFilesOnConnection} from '../../openint'
import type {
  FilePickerOptions,
  PickerConfiguration,
  SelectedFile,
  SharepointConnectionDetails,
  ThemeColors,
} from '../../types'
// @ts-ignore for import svg
import SharePointLogo from './../../../components/logos/sharepoint.svg'
import {SharePointMessageManager} from './messages'

interface SharePointPickerProps {
  connectionDetails: SharepointConnectionDetails
  options: FilePickerOptions
  themeColors: ThemeColors
  onClose: () => void
}

interface SharePointSite {
  id: string
  name: string
  displayName: string
  url: string
  hostname: string
  webUrl: string
}

const logoStyle: React.CSSProperties = {
  width: '24px',
  height: '24px',
  marginRight: '8px',
}

// {
//   "name": "cat.jpeg",
//   "webDavUrl": "https://xx.sharepoint.com/xx/cat.jpeg",
//   "webUrl": "https://xx.sharepoint.com/xx/cat.jpeg",
//   "size": 6572,
//   "image": {
//       "width": 275,
//       "height": 183
//   },
//   "photo": {},
//   "id": "017YGEU3UU5R7OHBZLENFKBF5ZETNMO4TN",
//   "parentReference": {
//       "driveId": "b!3kMg8Hd2m0OTS1c0sJBkv67KgeCO3CJHk6yAOJuEXaTHUzBHqAcvQbRx8SJ5arz6",
//       "sharepointIds": {
//           "listId": "473053c7-07a8-412f-b471-f122796abcfa",
//           "webId": "e081caae-dc8e-4722-93ac-80389b845da4",
//           "siteId": "f02043de-7677-439b-934b-5734b09064bf",
//           "siteUrl": "https://xx.sharepoint.com"
//       }
//   },
//   "sharepointIds": {
//       "listItemUniqueId": "e37eec94-2b87-4a23-a097-b924dac7726d",
//       "listItemId": "1",
//       "listId": "473053c7-07a8-412f-b471-f122796abcfa",
//       "webId": "e081caae-dc8e-4722-93ac-80389b845da4",
//       "siteId": "f02043de-7677-439b-934b-5734b09064bf",
//       "siteUrl": "https://xx.sharepoint.com"
//   },
//   "@sharePoint.embedUrl": "https://xx.sharepoint.com/_layouts/15/Embed.aspx?UniqueId=e37eec94%2D2b87%2D4a23%2Da097%2Db924dac7726d",
//   "@sharePoint.endpoint": "https://xx.sharepoint.com/_api/v2.0",
//   "@sharePoint.listUrl": "https://xx.sharepoint.com/Shared%20Documents"
// }
function onSelectMapper(file: any): SelectedFile {
  return {
    id: file.id,
    name: file.name,
    type: file.size ? 'file' : 'folder',
    driveId: file?.parentReference?.driveId,
    driveGroupId: file?.parentReference?.sharepointIds?.siteId,
  }
}

export const SharePointPicker: React.FC<SharePointPickerProps> = ({
  connectionDetails,
  options,
  themeColors,
  onClose,
}) => {
  const [sites, setSites] = useState<SharePointSite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSite, setSelectedSite] = useState<SharePointSite | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const onSelect = async (files: any[]) => {
    const selectedFiles = files.map(onSelectMapper)

    await persistSelectedFilesOnConnection(selectedFiles)
    return options.onSelect
      ? options.onSelect(selectedFiles)
      : Promise.resolve()
  }
  const messageManager = useMemo(() => {
    return new SharePointMessageManager(
      uuid(),
      connectionDetails.clientId,
      onSelect,
      onClose,
    )
  }, [onClose])

  const createPickerConfig = useCallback(
    (siteUrl: string): PickerConfiguration => ({
      sdk: '8.0',
      entry: {
        sharePoint: {
          siteUrl: siteUrl,
        },
      },
      authentication: {},
      messaging: {
        origin: window.location.origin,
        channelId: messageManager.getChannelId(),
      },
      selection: {
        mode: options.multiselect ? 'multiple' : 'single',
      },
      typesAndSources: {
        mode: options.folderSelect ? 'folders' : 'all',
        pivots: ['recent', 'shared', 'discover'],
      },
    }),
    [options.multiselect, options.folderSelect, messageManager],
  )

  const fetchSites = useCallback(async () => {
    setIsLoading(true)
    try {
      const url = 'https://graph.microsoft.com/v1.0/sites?search=*'

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${connectionDetails.accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Error fetching followed sites: ${response.statusText}`)
      }

      const data = await response.json()

      // most recent one first
      setSites(
        data.value
          .sort(
            (a: any, b: any) =>
              new Date(b.lastModifiedDateTime).getTime() -
              new Date(a.lastModifiedDateTime).getTime(),
          )
          .map((s: any) => ({
            id: s.id,
            name: s.name,
            displayName: s.displayName,
            url: s.webUrl,
            hostname: s.siteCollection.hostname,
            webUrl: s.webUrl,
          })),
      )
    } catch (error) {
      console.error('Failed to fetch SharePoint sites:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSites()
  }, [fetchSites])

  const filteredSites = useMemo(() => {
    return sites.filter(
      (site) =>
        site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.url.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [sites, searchTerm])

  const handleSiteSelect = useCallback((site: SharePointSite) => {
    setSelectedSite(site)
  }, [])

  const handleConfirmSelection = useCallback(() => {
    if (selectedSite) {
      const config = createPickerConfig(selectedSite.url)
      messageManager.openPicker(selectedSite.hostname, config)
    }
  }, [selectedSite, createPickerConfig, messageManager])

  return (
    <div
      className="relative p-4"
      style={{
        color: themeColors.foreground,
        backgroundColor: themeColors.background,
        width: isLoading ? undefined : '420px',
      }}>
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <Spinner color={themeColors.accent} />
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center">
              <SharePointLogo style={logoStyle} />
              <p
                className="text-xl font-bold"
                style={{color: themeColors.primary}}>
                Select Site
              </p>
            </div>
            <button
              onClick={messageManager.close}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: themeColors.foreground,
              }}
              aria-label="Close">
              ×
            </button>
          </div>
          <Input
            type="text"
            placeholder="Search SharePoint sites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
            style={
              {
                backgroundColor: themeColors.background,
                color: themeColors.foreground,
                borderColor: themeColors.border,
                '--tw-ring-color': `${themeColors.primary}40`,
              } as React.CSSProperties
            }
          />
          <ScrollArea
            className="rounded"
            style={{borderColor: themeColors.border}}>
            <div style={{maxHeight: '320px'}}>
              {filteredSites.map((site) => (
                <div
                  key={site.id}
                  className="flex items-center p-2 hover:bg-gray-100"
                  style={{borderBottomColor: themeColors.border}}>
                  <Checkbox
                    id={`site-${site.id}`}
                    checked={selectedSite?.id === site.id}
                    onCheckedChange={() => handleSiteSelect(site)}
                    className="mr-2"
                    style={
                      {
                        backgroundColor:
                          selectedSite?.id === site.id
                            ? themeColors.accent
                            : themeColors.background,
                      } as React.CSSProperties
                    }
                  />
                  <label
                    htmlFor={`site-${site.id}`}
                    className="flex-grow cursor-pointer">
                    <a
                      href={site.webUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline">
                      {site.displayName}
                    </a>
                  </label>
                </div>
              ))}
              {/* TODO: add different error if no sites or api call fails using toast */}
              {filteredSites.length === 0 && (
                <p className="text-gray-500">
                  No SharePoint sites with that name
                </p>
              )}
            </div>
          </ScrollArea>
          <div style={{display: 'flex', justifyContent: 'flex-end'}}>
            <Button
              onClick={handleConfirmSelection}
              disabled={!selectedSite}
              className="mt-4"
              style={{
                backgroundColor: themeColors.button,
                color: themeColors.buttonForeground,
                borderColor: themeColors.buttonStroke,
              }}>
              Continue
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
