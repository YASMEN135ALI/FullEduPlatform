from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, TeacherProfile, CompanyProfile


@receiver(post_save, sender=User)
def create_teacher_profile_after_approval(sender, instance, **kwargs):
    if instance.user_type == 'teacher' and instance.is_approved:
        TeacherProfile.objects.get_or_create(user=instance)


@receiver(post_save, sender=User)
def create_company_profile_after_approval(sender, instance, **kwargs):
    if instance.user_type == 'company' and instance.is_approved:
        CompanyProfile.objects.get_or_create(
            user=instance,
            defaults={'company_name': instance.username}
        )
