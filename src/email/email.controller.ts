import { Body, Controller, Post } from "@nestjs/common";
import { EmailService } from "./email.service";

@Controller("email")
export class EmailController {
  constructor(private readonly emailService: EmailService) {}
  @Post("send")
  async sendEmail(@Body() emailData: { receiver; subject; content }) {
    const { receiver, subject, content } = emailData;
    let response = await this.emailService.sendMail(receiver, subject, content);
    console.log(response);
    return {
      data: response,
    };
  }
}
