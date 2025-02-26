import MailTemplate from "./template";

export default class Verification extends MailTemplate {
  constructor(public link: string, public app: string) {
    super();
  }
  render() {
    return `
    Thank you for registering to ${this.app},
    Please click the following link to verify your email address:
    ${this.link}
    `;
  }
}