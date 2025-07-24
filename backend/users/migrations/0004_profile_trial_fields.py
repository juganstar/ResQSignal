from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0003_profile_first_alert_sent"),
    ]

    operations = [
        migrations.AddField(
            model_name="profile",
            name="has_used_trial",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="profile",
            name="payment_method_added",
            field=models.BooleanField(default=False),
        ),
    ]
