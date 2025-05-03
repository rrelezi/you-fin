# YouFin Email Configuration Guide

This guide shows how to set up email functionality in the YouFin application.

## Environment Variables

Add these variables to your `.env` file:

```
# Email Configuration - Development
# For development, you can create test credentials at https://ethereal.email/create
ETHEREAL_EMAIL=your_ethereal_email
ETHEREAL_PASSWORD=your_ethereal_password

# Email Configuration - Production
EMAIL_FROM=noreply@youfin.app
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_username
SMTP_PASSWORD=your_smtp_password
```

## Using Email Services

### For Development
1. Go to https://ethereal.email/create
2. Create a new account and copy the credentials
3. Add them to your `.env` file as shown above
4. Emails in development mode will be captured and viewable in the ethereal.email interface

### For Production
You can use any of these services:

1. **SendGrid**
   - Create an account at https://sendgrid.com/
   - Set up a sender identity
   - Get API key and add to environment variables
   - Use these settings:
     ```
     SMTP_HOST=smtp.sendgrid.net
     SMTP_PORT=587
     SMTP_SECURE=false
     SMTP_USER=apikey
     SMTP_PASSWORD=your_sendgrid_api_key
     ```

2. **Mailgun**
   - Create an account at https://www.mailgun.com/
   - Set up a domain
   - Get API key and add to environment variables
   - Use these settings:
     ```
     SMTP_HOST=smtp.mailgun.org
     SMTP_PORT=587
     SMTP_SECURE=false
     SMTP_USER=your_mailgun_smtp_username
     SMTP_PASSWORD=your_mailgun_smtp_password
     ```

3. **Amazon SES**
   - Create an account at https://aws.amazon.com/ses/
   - Set up your verified identities
   - Create SMTP credentials
   - Use these settings:
     ```
     SMTP_HOST=email-smtp.us-east-1.amazonaws.com (use your region)
     SMTP_PORT=587
     SMTP_SECURE=false
     SMTP_USER=your_ses_smtp_username
     SMTP_PASSWORD=your_ses_smtp_password
     ```

## Email Templates

YouFin uses the following email templates:

1. **Verification Email** - Sent when a user registers
2. **Password Reset Email** - Sent when a user requests password reset
3. **2FA Setup Email** - Sent when a user enables two-factor authentication
4. **Notification Email** - Used for general notifications

These templates are defined in `src/utils/email.js` and use HTML with inline CSS for styling.

## Testing

To test emails manually, use the `/api/auth/test-email` endpoint (development only):

```
POST /api/auth/test-email
{
  "email": "test@example.com",
  "type": "verification" | "reset" | "2fa" | "notification"
}
```

This will trigger the email sending process without affecting database records. 