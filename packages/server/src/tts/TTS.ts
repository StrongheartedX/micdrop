import { EventEmitter } from 'eventemitter3'
import { Readable } from 'stream'
import { Logger } from '../Logger'

export interface TTSEvents {
  Audio: [Buffer]
  Failed: [string[]]
}

export abstract class TTS extends EventEmitter<TTSEvents> {
  public logger?: Logger

  abstract speak(textStream: Readable): void
  abstract cancel(): void

  protected log(...message: any[]) {
    this.logger?.log(...message)
  }

  destroy() {
    this.log('Destroyed')
    this.cancel()
  }
}
