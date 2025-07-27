from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('users', '0005_force_trial_start'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='trial_start',
            field=models.DateTimeField(null=True, blank=True, verbose_name='trial_start_temp'),
        ),
        migrations.AlterField(
            model_name='profile',
            name='trial_start',
            field=models.DateTimeField(null=True, blank=True),
        ),
    ]
