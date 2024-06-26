# Generated by Django 3.2.24 on 2024-03-23 16:10

import django.contrib.postgres.fields
from django.db import migrations, models
import officehours_api.models


class Migration(migrations.Migration):

    dependencies = [
        ('officehours_api', '0023_auto_20230411_0302'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='otp_expiration',
            field=models.DateTimeField(blank=True, default=None, null=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='otp_phone_number',
            field=models.CharField(blank=True, default='', max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='otp_token',
            field=models.CharField(blank=True, default='', max_length=4, null=True),
        ),
    ]
