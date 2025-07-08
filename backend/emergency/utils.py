def send_emergency_message(contact, user, message):
    print(f"[EMERGENCY] Message to {contact.name} ({contact.phone_number})")
    print(f"User: {user.username}")
    print(f"Message: {message or 'No message provided.'}")
