from django.conf import settings
from django.db import models
from django.contrib.auth.models import User
from django.dispatch import receiver
from django.db.models.signals import post_save
from safedelete.models import (
    SafeDeleteModel, SOFT_DELETE, SOFT_DELETE_CASCADE, HARD_DELETE,
)
from safedelete.signals import pre_softdelete
from jsonfield import JSONField

from .backends.bluejeans import Bluejeans

if settings.BLUEJEANS_CLIENT_ID and settings.BLUEJEANS_CLIENT_SECRET:
    bluejeans = Bluejeans(
        client_id=settings.BLUEJEANS_CLIENT_ID,
        client_secret=settings.BLUEJEANS_CLIENT_SECRET,
    )
else:
    bluejeans = None


class Profile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return f'user={self.user.username}'


class Queue(SafeDeleteModel):
    _safedelete_policy = SOFT_DELETE
    name = models.CharField(max_length=100)
    hosts = models.ManyToManyField(User)
    created_at = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Meeting(SafeDeleteModel):
    _safedelete_policy = SOFT_DELETE_CASCADE
    queue = models.ForeignKey(
        Queue, on_delete=models.CASCADE,
        null=True
    )
    attendees = models.ManyToManyField(User, through='Attendee')
    started_at = models.DateTimeField(auto_now_add=True)
    removed_at = models.DateTimeField(null=True)
    ended_at = models.DateTimeField(null=True)

    MEETING_BACKEND_TYPES = [
        ('bluejeans', 'BlueJeans'),
    ]
    backend_type = models.CharField(max_length=20,
                                    choices=MEETING_BACKEND_TYPES,
                                    null=True)
    backend_metadata = JSONField(null=True, default=dict)

    @property
    def is_active(self):
        return bool(not(self.removed_at or self.ended_at))

    def save(self, *args, **kwargs):
        if not self.backend_type and bluejeans:
            self.backend_type = 'bluejeans'
        if self.backend_type:
            backend = globals()[self.backend_type]
            if backend:
                user_email = self.queue.hosts.first().email
                self.backend_metadata['user_email'] = user_email
                self.backend_metadata = backend.save_user_meeting(
                    self.backend_metadata,
                )

        super().save(*args, **kwargs)


class Attendee(SafeDeleteModel):
    '''
    Attendee must subclass SafeDeleteModel in order to be safedeleted
    when a Meeting is safedeleted
    '''
    # SOFT_DELETE is breaking some interactions, need to investigate
    _safedelete_policy = HARD_DELETE
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
    )
    meeting = models.ForeignKey(
        Meeting,
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return f'user={self.user.username}'


@receiver(post_save, sender=User)
def post_save_user_signal_handler(sender, instance, created, **kwargs):
    try:
        instance.profile
    except User.profile.RelatedObjectDoesNotExist:
        instance.profile = Profile.objects.create(user=instance)


@receiver(pre_softdelete, sender=Meeting)
def pre_delete_meeting_signal_handler(sender, instance, **kwargs):
    if instance.backend_type:
        backend = globals()[instance.backend_type]
        if backend:
            backend.remove_user_meeting(instance.backend_metadata)
            instance.backend_metadata.clear()
