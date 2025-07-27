from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('users', '0006_fix_trial_start_column'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                ALTER TABLE users_profile 
                ADD COLUMN IF NOT EXISTS trial_start timestamp;
            """,
            reverse_sql="""
                ALTER TABLE users_profile 
                DROP COLUMN IF EXISTS trial_start;
            """
        )
    ]
