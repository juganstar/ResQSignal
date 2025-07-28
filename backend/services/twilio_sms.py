import os
import phonenumbers
from twilio.rest import Client
from dotenv import load_dotenv

load_dotenv()

TWILIO_ACCOUNT_SID  = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN   = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

def _to_e164(raw):
    """Return E.164 string or None if invalid / missing."""
    if not raw:
        return None
    try:
        parsed = phonenumbers.parse(raw, None)
        if not phonenumbers.is_valid_number(parsed):
            return None
        return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
    except phonenumbers.NumberParseException:
        return None

def send_sms_alert(user, message):
    """
    Send `message` to every contact of `user`.
    Prints debug info to stdout so you can tail Railway / Docker logs.
    """
    print(f"📞 send_sms_alert() for user: {user.username}")

    contacts = user.contacts.all()
    print(f"📇 Found {contacts.count()} contacts.")

    for contact in contacts:
        raw = contact.phone_number
        to = _to_e164(raw)

        print(f"   raw='{raw}' → normalised='{to}'")

        if not to:
            print(f"   ⚠️  Skipping '{contact.name}' – invalid / empty number")
            continue

        try:
            msg = client.messages.create(
                body=message,
                from_=TWILIO_PHONE_NUMBER,
                to=to
            )
            print(f"   ✅ SID: {msg.sid}  Status: {msg.status}")
        except Exception as e:
            print(f"   ❌ Failed to send to {to}: {e}")