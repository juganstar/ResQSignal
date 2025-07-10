from twilio.rest import Client
import os

def send_emergency_message(contact, user, message):
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_PHONE_NUMBER")

    client = Client(account_sid, auth_token)

    final_message = message or f"{user.username} está em emergência. Por favor contacte de imediato."

    try:
        client.messages.create(
            body=final_message,
            from_=from_number,
            to=contact.phone_number
        )
        print(f"✅ SMS sent to {contact.phone_number}")
    except Exception as e:
        print(f"❌ Failed to send SMS to {contact.phone_number}: {str(e)}")
