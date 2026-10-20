from datetime import date

from internships.models import Internship
from hackathons.models import Hackathon


def normalize(value):
    """Convert text to lowercase for case-insensitive matching."""
    return str(value or "").strip().lower()


def split_terms(value):
    """Convert comma-separated text into normalized terms."""
    return {
        normalize(item)
        for item in str(value or "").split(",")
        if normalize(item)
    }


def matching_terms(preferences, text):
    """Return preferences that appear in the supplied text."""
    normalized_text = normalize(text)

    return {
        term
        for term in preferences
        if term and term in normalized_text
    }


def rank_internships(profile, limit=20):
    today = date.today()

    internships = Internship.objects.filter(
        status=Internship.Status.ACTIVE
    ).order_by("-created_at")

    results = []

    skills = {
        normalize(skill)
        for skill in profile.skills
        if normalize(skill)
    }
    roles = {
        normalize(role)
        for role in profile.preferred_roles
        if normalize(role)
    }
    locations = {
        normalize(location)
        for location in profile.preferred_locations
        if normalize(location)
    }

    work_mode = normalize(profile.work_mode)

    for internship in internships:
        if internship.deadline and internship.deadline < today:
            continue

        score = 0
        reasons = []

        opportunity_skills = normalize(internship.skills)
        opportunity_text = normalize(
            f"{internship.title} {internship.description} "
            f"{internship.internship_type}"
        )

        matched_skills = matching_terms(
            skills,
            opportunity_skills,
        )
        if matched_skills:
            score += min(50, len(matched_skills) * 15)
            reasons.append(
                "Matches your skills: "
                + ", ".join(sorted(matched_skills))
            )

        matched_roles = matching_terms(roles, opportunity_text)
        if matched_roles:
            score += min(25, len(matched_roles) * 15)
            reasons.append(
                "Matches your preferred roles: "
                + ", ".join(sorted(matched_roles))
            )

        matched_locations = matching_terms(
            locations,
            internship.location,
        )
        if matched_locations:
            score += 15
            reasons.append("Matches your preferred location")

        results.append({
            "id": internship.id,
            "title": internship.title,
            "company": internship.company,
            "location": internship.location,
            "description": internship.description,
            "skills": internship.skills,
            "stipend": internship.stipend,
            "internship_type": internship.internship_type,
            "deadline": (
                internship.deadline.isoformat()
                if internship.deadline
                else None
            ),
            "source_url": internship.source_url,
            "match_score": min(score, 100),
            "match_reasons": reasons,
        })

    results.sort(
        key=lambda item: (
            item["match_score"],
            item["title"].lower(),
        ),
        reverse=True,
    )

    return results[:limit]


def rank_hackathons(profile, limit=20):
    today = date.today()

    hackathons = Hackathon.objects.filter(
        status=Hackathon.Status.ACTIVE
    ).order_by("-created_at")

    results = []

    skills = {
        normalize(skill)
        for skill in profile.skills
        if normalize(skill)
    }
    roles = {
        normalize(role)
        for role in profile.preferred_roles
        if normalize(role)
    }
    locations = {
        normalize(location)
        for location in profile.preferred_locations
        if normalize(location)
    }

    work_mode = normalize(profile.work_mode)

    for hackathon in hackathons:
        if (
            hackathon.registration_deadline
            and hackathon.registration_deadline < today
        ):
            continue

        score = 0
        reasons = []

        opportunity_text = normalize(
            f"{hackathon.title} {hackathon.description} "
            f"{hackathon.themes} {hackathon.event_type}"
        )

        matched_skills = matching_terms(
            skills,
            opportunity_text,
        )
        if matched_skills:
            score += min(50, len(matched_skills) * 15)
            reasons.append(
                "Matches your skills: "
                + ", ".join(sorted(matched_skills))
            )

        matched_roles = matching_terms(roles, opportunity_text)
        if matched_roles:
            score += min(25, len(matched_roles) * 15)
            reasons.append(
                "Matches your preferred roles: "
                + ", ".join(sorted(matched_roles))
            )

        matched_locations = matching_terms(
            locations,
            hackathon.location,
        )
        if matched_locations:
            score += 15
            reasons.append("Matches your preferred location")

        mode = normalize(hackathon.participation_mode)
        if work_mode == "remote" and mode == "online":
            score += 10
            reasons.append("Online participation matches your preference")
        elif work_mode == "onsite" and mode == "offline":
            score += 10
            reasons.append("Offline participation matches your preference")
        elif work_mode == "hybrid" and mode == "hybrid":
            score += 10
            reasons.append("Hybrid participation matches your preference")

        results.append({
            "id": hackathon.id,
            "title": hackathon.title,
            "organizer": hackathon.organizer,
            "location": hackathon.location,
            "description": hackathon.description,
            "themes": hackathon.themes,
            "event_type": hackathon.event_type,
            "participation_mode": hackathon.participation_mode,
            "registration_deadline": (
                hackathon.registration_deadline.isoformat()
                if hackathon.registration_deadline
                else None
            ),
            "start_date": (
                hackathon.start_date.isoformat()
                if hackathon.start_date
                else None
            ),
            "end_date": (
                hackathon.end_date.isoformat()
                if hackathon.end_date
                else None
            ),
            "source_url": hackathon.source_url,
            "match_score": min(score, 100),
            "match_reasons": reasons,
        })

    results.sort(
        key=lambda item: (
            item["match_score"],
            item["title"].lower(),
        ),
        reverse=True,
    )

    return results[:limit]
