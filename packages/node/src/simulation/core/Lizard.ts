let _nextId = 0

export class Lizard {
  readonly id: string
  x: number
  y: number

  constructor(x = 0, y = 0) {
    this.id = `lizard-${_nextId++}`
    this.x = x
    this.y = y
  }
}
