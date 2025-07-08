import os
import stripe
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from users.models import Profile
from billing.models import Subscription


stripe.api_key = os.getenv("STRIPE_SECRET_KEY")


@api_view(['POST'])
@permission_classes([IsAuthenticated])  # 💥 Require login for safety
@csrf_exempt 
def create_checkout_session(request):
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

    profile = request.user.profile
    email = request.user.email
    plan = request.data.get("plan")

    if plan == "basic":
        price_id = os.getenv("STRIPE_BASIC_PRICE_ID")
    elif plan == "premium":
        price_id = os.getenv("STRIPE_PREMIUM_PRICE_ID")
    else:
        return Response({'error': 'Invalid plan.'}, status=400)

    try:
        # 🔒 If customer already exists, reuse it
        if profile.stripe_customer_id:
            customer_id = profile.stripe_customer_id
        else:
            customer = stripe.Customer.create(email=email)
            customer_id = customer.id
            profile.stripe_customer_id = customer_id
            profile.save()

        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=['card'],
            mode='subscription',
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            success_url='http://localhost:5173/success',
            cancel_url='http://localhost:5173/cancel',
        )

        return Response({'url': session.url})

    except Exception as e:
        print("❌ Checkout Error:", e)
        return Response({'error': str(e)}, status=500)


@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    secret = os.getenv("STRIPE_WEBHOOK_SECRET")

    if not secret:
        return HttpResponse("Missing webhook secret", status=500)

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, secret)
    except Exception as e:
        return HttpResponse(f"Webhook error: {e}", status=400)

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        handle_checkout_session_completed(session)

    return HttpResponse(status=200)


def handle_checkout_session_completed(session):
    import stripe
    from billing.models import Subscription
    from users.models import Profile
    from django.conf import settings

    customer_id = session.get('customer')
    subscription_id = session.get('subscription')

    # Get full subscription data from Stripe (for item ID + price)
    try:
        subscription_data = stripe.Subscription.retrieve(subscription_id)
        item_data = subscription_data['items']['data'][0]
        item_id = item_data['id']
        price_id = item_data['price']
    except Exception as e:
        print(f"❌ Failed to retrieve subscription data: {e}")
        return

    # Determine plan
    plan = "unknown"
    if price_id == os.getenv("STRIPE_BASIC_PRICE_ID"):
        plan = "basic"
    elif price_id == os.getenv("STRIPE_PREMIUM_PRICE_ID"):
        plan = "premium"

    # Get customer email safely
    try:
        customer = stripe.Customer.retrieve(customer_id)
        customer_email = customer.email
    except Exception as e:
        print(f"⚠️ Could not get customer email: {e}")
        customer_email = None

    # Match to existing user
    try:
        profile = Profile.objects.get(stripe_customer_id=customer_id)
        user = profile.user
    except Profile.DoesNotExist:
        user = None

    # Save subscription
    Subscription.objects.update_or_create(
        stripe_customer_id=customer_id,
        defaults={
            "user": user,
            "email": customer_email,
            "stripe_subscription_id": subscription_id,
            "plan": plan,
            "status": "active",
            "subscription_item_id": item_id,
        }
    )

    print(f"✅ Subscription saved for {customer_email} ({plan})")


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_billing_portal_session(request):
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

    profile = request.user.profile
    customer_id = profile.stripe_customer_id

    if not customer_id:
        return Response({"error": "No Stripe customer found"}, status=400)

    try:
        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url="http://localhost:5173/dashboard",  # Or wherever you want to send them after
        )
        return Response({"url": session.url})
    except Exception as e:
        return Response({"error": str(e)}, status=500)
