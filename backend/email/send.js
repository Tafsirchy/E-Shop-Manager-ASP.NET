#!/usr/bin/env node
/* Sends an email via nodemailer using SMTP credentials from the environment.
 * Invoked by the ASP.NET EmailService after an admin marks an order Delivered.
 *
 * Environment:
 *   EShop_SMTP_HOST      SMTP server host (e.g. smtp.gmail.com)
 *   EShop_SMTP_PORT      SMTP port (default 587)
 *   EShop_SMTP_USER      SMTP username / sender address login
 *   EShop_SMTP_PASS      SMTP password / app password
 *   EShop_SMTP_FROM_NAME Display name for the sender
 *
 * Args:
 *   --to <email>     recipient address
 *   --subject <str>  subject line
 *   --html <str>     HTML body
 */
'use strict';

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

function arg(name, fallback) {
  const idx = process.argv.indexOf('--' + name);
  return idx !== -1 && process.argv[idx + 1] != null ? process.argv[idx + 1] : fallback;
}

const host = process.env.EShop_SMTP_HOST;
const port = parseInt(process.env.EShop_SMTP_PORT || '587', 10);
const user = process.env.EShop_SMTP_USER;
const pass = process.env.EShop_SMTP_PASS;

const to = arg('to', '');
const subject = arg('subject', '');
const html = arg('html', '');

async function main() {
  if (!host || !user || !pass) {
    // No SMTP configured: record the intended email to a log file so the flow
    // is observable without real credentials, and exit successfully.
    const logDir = path.join(__dirname, '..', 'logs');
    fs.mkdirSync(logDir, { recursive: true });
    const stamp = new Date().toISOString();
    const line = `[${stamp}] [DISABLED-SMTP] to=${to} subject=${subject}\n${html}\n---\n`;
    fs.appendFileSync(path.join(logDir, 'email-log.txt'), line);
    console.log('EMAIL_NOT_CONFIGURED');
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const info = await transporter.sendMail({
    from: `"${process.env.EShop_SMTP_FROM_NAME || 'E-Shop Manager'}" <${process.env.EShop_SMTP_FROM_ADDR || user}>`,
    to,
    subject,
    html,
  });

  console.log('EMAIL_SENT:' + (info.messageId || ''));
}

main().catch((err) => {
  console.error('EMAIL_FAILED:' + (err && err.message ? err.message : String(err)));
  process.exitCode = 1;
});
