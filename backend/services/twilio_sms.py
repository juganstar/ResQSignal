import os
from twilio.rest import Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Twilio credentials
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

def send_sms_alert(user, message):
    """
    Sends the alert message to all contacts of a user via Twilio SMS.
    """
    contacts = user.contacts.all()  # ✅ correct related_name

    for contact in contacts:
        if contact.phone_number:
            try:
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
