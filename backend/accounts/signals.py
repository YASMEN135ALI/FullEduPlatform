from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import (
    JobApplication,
    LessonProgress,
    Certificate,
    CourseEnrollment
)
from .triggers import notify_student


@receiver(post_save, sender=CourseEnrollment)
def notify_course_enrollment(sender, instance, created, **kwargs):
    if created:
        notify_student(
            student=instance.student,
            title="تم تسجيلك في كورس جديد",
            message=f"لقد تم تسجيلك في كورس {instance.course.title}.",
            type="course",
            icon="book",
            link=f"/course/{instance.course.id}/"
        )


@receiver(post_save, sender=JobApplication)
def job_application_status_changed(sender, instance, created, **kwargs):
    if created:
        return

    if instance.status == "accepted":
        notify_student(
            student=instance.student,
            title="تم قبول طلبك",
            message=f"لقد تم قبول طلبك لوظيفة {instance.job.title}.",
            type="job",
            icon="check"
        )

    elif instance.status == "rejected":
        notify_student(
            student=instance.student,
            title="تم رفض طلبك",
            message=f"نأسف، تم رفض طلبك لوظيفة {instance.job.title}.",
            type="job",
            icon="close"
        )


@receiver(post_save, sender=LessonProgress)
def lesson_completed(sender, instance, created, **kwargs):
    if not created and instance.completed:
        notify_student(
            student=instance.student,
            title="أحسنت!",
            message=f"لقد أكملت درس {instance.lesson.title}.",
            type="progress",
            icon="star"
        )


@receiver(post_save, sender=Certificate)
def certificate_issued(sender, instance, created, **kwargs):
    if created:
        notify_student(
            student=instance.student,
            title="شهادة جديدة!",
            message=f"لقد حصلت على شهادة في كورس {instance.course.title}.",
            type="certificate",
            icon="award"
        )
