from django.urls import reverse
from .models import (
    StudentNotification,
    TeacherNotification,
    CompanyNotification
)

# ----------------------------------------------------
# Student Helpers
# ----------------------------------------------------
def notify_student(student, title, message, type="system", icon="info", link=None):
    StudentNotification.objects.create(
        student=student,
        title=title,
        message=message,
        type=type,
        icon=icon,
        link=link
    )


# ----------------------------------------------------
# Teacher Helpers
# ----------------------------------------------------
def notify_teacher(teacher, title, message):
    TeacherNotification.objects.create(
        teacher=teacher,
        title=title,
        message=message
    )


# ----------------------------------------------------
# Company Helpers
# ----------------------------------------------------
def notify_company(company, title, message):
    CompanyNotification.objects.create(
        company=company,
        title=title,
        message=message
    )
