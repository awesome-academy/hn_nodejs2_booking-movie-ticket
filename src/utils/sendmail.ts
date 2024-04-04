import ejs from 'ejs';
import * as dotenv from 'dotenv';
import { transporter } from '../config/mail';
dotenv.config();

export async function sendMail({ email, subject, context, templatePath }) {
  const data = await ejs.renderFile(templatePath, context);

  const mailOptions = {
    from: `NAMCINEMA <${process.env.EMAIL_HOST_USER}>`,
    to: email,
    subject: subject,
    html: data,
  };

  await transporter.sendMail(mailOptions);
}
