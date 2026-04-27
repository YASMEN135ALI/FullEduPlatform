# search.py

from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank

# كل الموديلات موجودة داخل نفس الـ app (accounts)
from .models import (
    Course,
    Lesson,
    JobPost,
    TeacherProfile,
    CompanyProfile
)


# ============================
# 🔍 بحث الكورسات
# ============================
def search_courses(query):
    vector = (
        SearchVector('title', weight='A') +
        SearchVector('description', weight='B')
    )
    search_query = SearchQuery(query)

    return (
        Course.objects
        .annotate(search=vector, rank=SearchRank(vector, search_query))
        .filter(search=search_query)
        .order_by('-rank')
    )


# ============================
# 🔍 بحث الدروس
# ============================
def search_lessons(query):
    vector = (
        SearchVector('title', weight='A') +
        SearchVector('content', weight='B')
    )
    search_query = SearchQuery(query)

    return (
        Lesson.objects
        .annotate(search=vector, rank=SearchRank(vector, search_query))
        .filter(search=search_query)
        .order_by('-rank')
    )


# ============================
# 🔍 بحث المدرّسين
# ============================
def search_teachers(query):
    vector = (
        SearchVector('full_name', weight='A') +
        SearchVector('specialization', weight='B') +
        SearchVector('bio', weight='C')
    )
    search_query = SearchQuery(query)

    return (
        TeacherProfile.objects
        .annotate(search=vector, rank=SearchRank(vector, search_query))
        .filter(search=search_query)
        .order_by('-rank')
    )


# ============================
# 🔍 بحث الشركات
# ============================
def search_companies(query):
    vector = (
        SearchVector('company_name', weight='A') +
        SearchVector('industry', weight='B') +
        SearchVector('location', weight='C')
    )
    search_query = SearchQuery(query)

    return (
        CompanyProfile.objects
        .annotate(search=vector, rank=SearchRank(vector, search_query))
        .filter(search=search_query)
        .order_by('-rank')
    )


# ============================
# 🔍 بحث الوظائف
# ============================
def search_jobs(query):
    vector = (
        SearchVector('title', weight='A') +
        SearchVector('description', weight='B') +
        SearchVector('requirements', weight='B')
    )
    search_query = SearchQuery(query)

    return (
        JobPost.objects
        .annotate(search=vector, rank=SearchRank(vector, search_query))
        .filter(search=search_query)
        .order_by('-rank')
    )
