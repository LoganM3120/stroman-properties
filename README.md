This repository is for the start of your real estate portfolio and website. Phase 1: Upload photos, generate website, launch for
 future clients

**Current Steps**
- Allow for user signup/login
- Determine ways to get money from end customer with least amount getting taken off the top (Zelle, Stripe, PayPal, Venmo, etc.)
- Display current property in a seemless website, making sure each picture loads fast. Even if that means taking away quality when the connection is bad (lazy loading)

## Development

This project uses Next.js. To start the development server:

```
npm install
npm run dev
```

Place property images under `public/images` (e.g. `public/images/kitchen`, `public/images/living-room`).

### Environment variables

Email messages submitted through the contact modal are delivered with Nodemailer. Add the following entries to your `.env` file (or the hosting provider’s environment variable settings):

```
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_SECURE=false # set to true if your SMTP provider requires TLS on connect
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password-or-app-key
SMTP_FROM_EMAIL=optional-from-address@example.com
CONTACT_RECIPIENT_EMAIL=where-contact-messages-should-go@example.com
```

`SMTP_FROM_EMAIL` is optional—when omitted, the `SMTP_USER` value is used as the sender. `SMTP_PASS` is where you should place the App Key from your email provider if they support SMTP authentication via application keys.
