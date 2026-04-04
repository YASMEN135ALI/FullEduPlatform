from django.contrib import admin
from .models import (
    User,
    TeacherProfile,
    CompanyProfile,
    Course,
    Lesson,
    CourseEnrollment,
    CourseReview,
    Certificate,
    JobPost,
    JobApplication,
)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'user_type', 'is_approved', 'created_at')
    list_filter = ('user_type', 'is_approved')
    search_fields = ('username', 'email')


admin.site.register(TeacherProfile)
admin.site.register(CompanyProfile)
admin.site.register(Course)
admin.site.register(Lesson)
admin.site.register(CourseEnrollment)
admin.site.register(CourseReview)
admin.site.register(Certificate)
admin.site.register(JobPost)
admin.site.register(JobApplication)
