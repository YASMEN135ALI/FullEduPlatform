from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import (
    JobApplication,
    LessonProgress,
    Certificate,
    CourseEnrollment,CourseReview,Quiz

)
from .triggers import notify_student, notify_teacher


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

@receiver(post_save, sender=CourseEnrollment)
def notify_teacher_student_enrolled(sender, instance, created, **kwargs):
    if created:
        course = instance.course
        teacher = course.teacher
        student = instance.student

        notify_teacher(
            teacher=teacher,
            title="طالب جديد سجّل في دورتك",
            message=f"{student.full_name} سجّل في دورة {course.title}",
            type="enrollment",
            icon="user-plus",
            link=f"/teacher/course/{course.id}/"
        )

@receiver(post_save, sender=LessonProgress)
def notify_teacher_lesson_completed(sender, instance, created, **kwargs):
    if not created and instance.completed:
        lesson = instance.lesson
        course = lesson.course
        teacher = course.teacher
        student = instance.student

        notify_teacher(
            teacher=teacher,
            title="طالب أكمل درسًا",
            message=f"{student.full_name} أكمل درس {lesson.title} في دورة {course.title}",
            type="progress",
            icon="check-circle",
            link=f"/teacher/lesson/{lesson.id}/"
        )

@receiver(post_save, sender=Certificate)
def notify_teacher_course_completed(sender, instance, created, **kwargs):
    if created:
        course = instance.course
        teacher = course.teacher
        student = instance.student

        notify_teacher(
            teacher=teacher,
            title="طالب أكمل الدورة",
            message=f"{student.full_name} أكمل دورة {course.title} وحصل على شهادة",
            type="course-complete",
            icon="award",
            link=f"/teacher/course/{course.id}/"
        )

@receiver(post_save, sender=CourseReview)
def notify_teacher_new_review(sender, instance, created, **kwargs):
    if created:
        course = instance.course
        teacher = course.teacher
        student = instance.student

        notify_teacher(
            teacher=teacher,
            title="تقييم جديد",
            message=f"{student.full_name} قيّم دورتك {course.title}",
            type="review",
            icon="star",
            link=f"/teacher/course/{course.id}/"
        )

@receiver(post_save, sender=Quiz)
def notify_teacher_quiz_created(sender, instance, created, **kwargs):
    if created:
        teacher = instance.course.teacher

        notify_teacher(
            teacher=teacher,
            title="تم إنشاء اختبار جديد",
            message=f"تم إنشاء اختبار {instance.title} بنجاح",
            type="quiz",
            icon="file-plus",
            link=f"/teacher/quiz/{instance.id}/"
        )
