import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import * as ejs from "ejs";

@Injectable()
export class EmailService {
  async sendMail(receiver, subject, content) {
    return await new Promise((resolve, reject) => {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.SMTP_MAIL,
          pass: process.env.SMTP_PASS,
        },
      });

      ejs.renderFile(
        "src/email/template/note.ejs",
        { receiver, content },
        (err, data) => {
          if (err) {
            console.log(err);
          } else {
            let mailOptions = {
              from: process.env.EMAIL,
              to: receiver,
              subject: subject,
              html: data,
            };

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                reject({ status: false, error: error });
              } else {
                resolve({ status: true, message: info.messageId });
              }
            });
          }
        }
      );
    });
  }
}

//   ejs.renderFile(
//     "src/email/template/note.ejs",
//     { receiver, content },
//     (err, data) => {
//       if (err) {
//         console.log(err);
//       } else {
//         const mailOptions = {
//           from: "ronak.s@upsquare.in",
//           to: "ronak.s@upsquare.in",
//           subject: subject,
//           html: data,
//         };
//         transporter
//           .sendMail(mailOptions)
//           .then((result) => {
//             console.log(result, "result");
//             return 1;
//           })
//           .catch((err) => {
//             console.log(err, "error");
//             throw err;
//           });
//       }
//     }
//   );
// }
