
import { Resend } from "resend";
import env from "./env";
import MailTemplate from "../emails/template";
export interface MailConfig {
  from: string
  to: string[]
  subject: string
}

export class Mailer {
  private client;
  constructor() {
    this.client = new Resend(env.get('RESEND_API_KEY'))
  }
  async send(config: MailConfig, template: MailTemplate) {
    const result = await this.client.emails.send({
      from: config.from,
      to: config.to,
      subject: config.subject,
      text: template.render()
    })
    return result;
  }
}
export default new Mailer();