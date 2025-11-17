export class Logger {
  constructor(public name: string) {}

  log(...message: any[]) {
    const time = process.uptime().toFixed(3)
    console.log(`[${this.name} ${time}]`, ...message)
  }
}
