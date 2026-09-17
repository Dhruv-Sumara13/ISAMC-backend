# Membership email delivery on Render

Render free web services block SMTP ports 25, 465 and 587. Use the Brevo
HTTPS API for both administrator notifications and applicant confirmations.

In the Render backend service's Environment settings configure:

- `EMAIL_PROVIDER=brevo`
- `BREVO_API_KEY`: an active Brevo API key (not an SMTP password).
- `BREVO_SENDER_EMAIL`: a verified sender in that Brevo account.
- `BREVO_SENDER_NAME=ISAMC Team` (optional).
- `CONTACT_EMAIL`: the inbox that should receive membership applications.

Save the environment settings and deploy the updated backend. Keep API keys
in Render's environment settings; never commit them or put them in frontend variables.

The application is saved before the HTTP success response. Email delivery
continues after that response, so a successful submission does not prove inbox
delivery. Render logs show `Email accepted by Brevo` with a message ID when
Brevo accepts it. Check Brevo transactional logs for delivery, rejection,
bounce or sender-verification issues. HTTP 401 indicates invalid credentials;
HTTP 403 can indicate account restrictions. Consult the provider logs.

Existing failed emails are not automatically resent. Background deliveries
are not a durable queue and can be interrupted by a service restart.

For hosting that permits SMTP, set `EMAIL_PROVIDER=smtp` to use the existing
`CPANEL_*` settings. On Render, when `EMAIL_PROVIDER` is unset and a Brevo key
is present, the helper automatically selects Brevo.
