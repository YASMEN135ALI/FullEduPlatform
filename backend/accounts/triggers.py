from .models import StudentNotification, TeacherNotification, CompanyNotification

def notify_student(student, title, message, type="system", icon="info", link=None):
    StudentNotification.objects.create(
        student=student,
        title=title,
        message=message,
        type=type,
        icon=icon,
        link=link
    )

def notify_teacher(teacher, title, message, type="system", icon="info", link=None):
    TeacherNotification.objects.create(
        teacher=teacher,
        title=title,
        message=message,
        type=type,
        icon=icon,
        link=link
    )

def notify_company(company, title, message, type="system", icon="info", link=None):
    CompanyNotification.objects.create(
        company=company,
        title=title,
        message=message,
        type=type,
        icon=icon,
        link=link
    )
