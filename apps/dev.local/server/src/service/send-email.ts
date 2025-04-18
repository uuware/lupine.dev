import NodeMailer from 'nodemailer';
import { Logger } from 'lupine.api';
import { apiStorage } from 'lupine.api';

const logger = new Logger('email-api');
// this should be called from a request handler
export const sendSiteEmail = async (subject: string, body: string) => {
  // const currentSettings = AppConfig.get(AppConfig.WEB_SETTINGS_KEY);
  const siteEmail = await apiStorage.getWeb('siteEmail') || '';
  if (!siteEmail) {
    logger.error('Site email not set');
    return;
  }
  sendEmail(siteEmail, subject, body);
};

export const sendEmail = async (to: string, subject: string, body: string) => {
  return new Promise((resolve, reject) => {
    // const nodemailer = require('nodemailer');

    // TODO: move to .env file
    const transporter = NodeMailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env['SEND_EMAIL_USER'],
        pass: process.env['SEND_EMAIL_PASS'],
      },
    });

    const mailOptions = {
      from: process.env['SEND_EMAIL_USER'] || 'noreplay.sendonly@gmail.com',
      to: to,
      subject: subject,
      text: body,
    };

    transporter.sendMail(mailOptions, function (error: Error | null, info: NodeMailer.SentMessageInfo) {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        console.log('Email sent: ' + info.response);
        resolve(info);
      }
    });
  });
};
