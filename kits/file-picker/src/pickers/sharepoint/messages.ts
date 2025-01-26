import {PickerConfiguration, SelectedFile} from '../../types'
import {getSharepointToken} from './auth'

export class SharePointMessageManager {
  private port: MessagePort | null = null
  private pickerWindow: Window | null = null
  private channelId: string
  private clientId: string
  private onSelectCallback?: (files: SelectedFile[]) => void
  private onCloseCallback?: () => void

  constructor(
    channelId: string,
    clientId: string,
    onSelect?: (files: SelectedFile[]) => Promise<void>,
    onClose?: () => void,
  ) {
    this.channelId = channelId
    this.clientId = clientId
    this.onSelectCallback = onSelect
    this.onCloseCallback = onClose
  }

  getChannelId() {
    return this.channelId
  }

  async openPicker(sitehostname: string, config: PickerConfiguration) {
    const url = this.createPickerUrl(config, sitehostname)
    this.pickerWindow = window.open(
      url,
      'Picker',
      'width=1080,height=680,popup=yes',
    )

    if (!this.pickerWindow) {
      throw new Error('Failed to open picker window')
    }

    await this.setupMessageListener()
  }

  private createPickerUrl(
    config: PickerConfiguration,
    sitehostname: string,
  ): string {
    const baseUrl = `https://${sitehostname}`
    const queryString = new URLSearchParams({
      filePicker: JSON.stringify(config),
      locale: 'en-us',
    })
    return `${baseUrl}/_layouts/15/FilePicker.aspx?${queryString}`
  }

  private async setupMessageListener(): Promise<void> {
    return new Promise<void>((resolve) => {
      const messageListener = (event: MessageEvent) => {
        const message = event.data
        if (
          message.type === 'initialize' &&
          message.channelId === this.channelId
        ) {
          if (event.ports.length > 0 && event.ports[0]) {
            this.port = event.ports[0]
            this.port.start()

            this.port.addEventListener('message', (e) => {
              // console.log('Received message: type', e.data.type, e.data.data)
              this.handlePickerMessage(e)
            })
          }

          this.sendMessage({
            type: 'activate',
            data: {result: 'success'},
          })

          window.removeEventListener('message', messageListener)
          resolve()
        }
      }
      window.addEventListener('message', messageListener)
    })
  }

  private sendMessage(message: any) {
    if (this.port) {
      // console.log('Sending message:', message)
      this.port.postMessage(message)
    }
  }

  private async handlePickerMessage(event: MessageEvent) {
    const message = event.data

    this.sendMessage({
      type: 'acknowledge',
      id: message.id,
    })

    if (message.type === 'command') {
      await this.handleCommand(message)
    }
  }

  private async handleCommand(message: any) {
    const command = message.data

    switch (command.command) {
      case 'authenticate':
        this.sendMessage({
          type: 'result',
          id: message.id,
          data: {
            result: 'token',
            token: await getSharepointToken(command, this.clientId), // You'll need to pass the webUrl here
          },
        })
        break

      case 'close':
        this.close()
        break

      case 'pick':
        try {
          if (this.onSelectCallback) {
            await this.onSelectCallback(command.items)
          }
          this.sendMessage({
            type: 'result',
            id: message.id,
            data: {result: 'success'},
          })
          this.pickerWindow?.close()
        } catch (error) {
          this.sendMessage({
            type: 'result',
            id: message.id,
            data: {
              result: 'error',
              error: {
                code: 'unusableItem',
                message: (error as Error).message,
              },
            },
          })
        }
        break

      default:
        this.sendMessage({
          type: 'result',
          id: message.id,
          data: {
            result: 'error',
            error: {
              code: 'unsupportedCommand',
              message: command.command,
            },
          },
        })
    }
  }

  close() {
    if (this.pickerWindow) {
      this.pickerWindow.close()
    }
    if (this.onCloseCallback) {
      this.onCloseCallback()
    }
  }
}
