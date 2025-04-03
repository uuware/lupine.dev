import { ServerResponse } from 'http';
import { Logger, apiCache, ServerRequest, ApiHelper } from 'lupine.api';
import { sendEmail } from './send-email';

const logger = new Logger('qa');

export const addContact = async (req: ServerRequest, res: ServerResponse) => {
  const db = apiCache.getDb();

  // TODO: secure and httpOnly cookies
  const data = req.locals.json();
  if (!data || Array.isArray(data) || !data.name || !data.email || !data.subject || !data.message) {
    const response = {
      status: 'error',
      message: 'Wrong data.',
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  const subject = `Contact Form: ${data.email} - ${data.subject}`;
  const boyd = `Name: ${data.name}
Subject: ${data.subject}
Email: ${data.email}
Message: ${data.message}`;

  await sendEmail('yyonlineyy@gmail.com', subject, boyd);
  console.log(data);
  const response = {
    status: 'ok',
    message: 'You have submitted the contact form.',
  };
  ApiHelper.sendJson(req, res, response);
  return true;
};
