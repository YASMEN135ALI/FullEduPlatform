from .models import Notification

def notify(user, title, message, type="system", icon="info", link=None):
    Notification.objects.create(
        user=user,
        title=title,
        message=message,
        type=type,
        icon=icon,
        link=link
    )
