from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_profile_trial_fields'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='trial_start',
            field=models.DateTimeField(null=True, blank=True),
        ),
    ]
