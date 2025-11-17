import { PassThrough, Readable } from 'stream'
import { STT } from './STT'
import { Logger } from '..'

export interface FallbackSTTOptions {
  factories: Array<() => STT>
}

export class FallbackSTT extends STT {
  private stt: STT | null = null
  private sttIndex = -1 // Start at -1 because we need to increment it before using it

  constructor(private readonly options: FallbackSTTOptions) {
    super()
    if (this.options.factories.length === 0) {
      throw new Error('FallbackSTT: No factories provided')
    }
    this.startNextSTT()
  }

  transcribe(audioStream: Readable) {
    this.stt?.transcribe(audioStream)
  }

  destroy() {
    super.destroy()
    this.stt?.destroy()
    this.stt = null
    this.sttIndex = -1
  }

  private startNextSTT() {
    this.sttIndex++
    if (this.sttIndex >= this.options.factories.length) {
      this.sttIndex = 0
    }
    this.stt?.destroy()
    this.stt = this.options.factories[this.sttIndex]()
    this.stt.on('Transcript', this.onTranscript)
    this.stt.on('Failed', this.onFailed)

    // Set logger after event loop
    setTimeout(() => {
      if (this.stt && this.logger) {
        this.stt.logger = new Logger(this.stt.constructor.name)
      }
    }, 0)
  }

  private onTranscript = (transcript: string) => {
    this.emit('Transcript', transcript)
  }

  private onFailed = (chunks: Buffer[]) => {
    this.log('STT failed, trying next STT')
    this.startNextSTT()

    if (chunks.length > 0) {
      this.log('Sending audio chunks again')
      const stream = new PassThrough()
      this.stt?.transcribe(stream)
      chunks.forEach((chunk) => stream.write(chunk))
      stream.end()
    }
  }
}
