import MailTemplate from "./template";

export default class ResetPassword extends MailTemplate {
  constructor(public link: string, public app: string) {
    super();
  }
  render() {
    return `
    You told us that you forgot your password, if you really did please click the following link to reset your password:
    ${this.link} 
    If you didn’t mean to reset your password, then you can just ignore this email; your password will not change.
    `;
  }
}