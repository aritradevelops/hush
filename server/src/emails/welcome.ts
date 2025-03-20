export default class Welcome {
  constructor(public message: string) { }
  render() {
    return `Welcome to ${this.message}!`;
  }
}