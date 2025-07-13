import os
from twilio.rest import Client
from dotenv import load_dotenv

# Load environment variables (safe for local only — in Render, env vars are set by platform)
load_dotenv()

# Twilio credentials
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

def send_sms_alert(user, message):
    """
    Sends the alert message to all contacts of a user via Twilio SMS.
    Logs progress for debugging and confirms every send.
    """
    print(f"📞 send_sms_alert() called for user: {user.username}")
    
    contacts = user.contacts.all()
    print(f"📇 Found {contacts.count()} contacts:")

    for contact in contacts:
        print(f"➡️  {contact.name}: {contact.phone_number}")

    for contact in contacts:
        if contact.phone_number:
            try:
                print(f"📤 Sending SMS to {contact.name} ({contact.phone_number})...")
                client.messages.create(
                    body=message,
                    from_=TWILIO_PHONE_NUMBER,
                    to=contact.phone_number
                )
                print(f"[✅] SMS sent to {contact.name} ({contact.phone_number})")
            except Exception as e:
                print(f"[❌] Failed to send SMS to {contact.phone_number}: {e}")
        else:
            print(f"[⚠️] Skipping contact '{contact.name}' — no phone number")
