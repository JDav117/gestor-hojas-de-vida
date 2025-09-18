"""
Data models for the resume management system.
"""

import json
from datetime import datetime
from typing import List, Dict, Optional


class Experience:
    """Represents a work experience entry."""
    
    def __init__(self, company: str, position: str, start_date: str, 
                 end_date: Optional[str] = None, description: str = ""):
        self.company = company
        self.position = position
        self.start_date = start_date
        self.end_date = end_date
        self.description = description
    
    def to_dict(self) -> Dict:
        """Convert experience to dictionary."""
        return {
            'company': self.company,
            'position': self.position,
            'start_date': self.start_date,
            'end_date': self.end_date,
            'description': self.description
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Experience':
        """Create experience from dictionary."""
        return cls(
            company=data['company'],
            position=data['position'],
            start_date=data['start_date'],
            end_date=data.get('end_date'),
            description=data.get('description', '')
        )


class Education:
    """Represents an education entry."""
    
    def __init__(self, institution: str, degree: str, field: str, 
                 graduation_year: int, gpa: Optional[float] = None):
        self.institution = institution
        self.degree = degree
        self.field = field
        self.graduation_year = graduation_year
        self.gpa = gpa
    
    def to_dict(self) -> Dict:
        """Convert education to dictionary."""
        return {
            'institution': self.institution,
            'degree': self.degree,
            'field': self.field,
            'graduation_year': self.graduation_year,
            'gpa': self.gpa
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Education':
        """Create education from dictionary."""
        return cls(
            institution=data['institution'],
            degree=data['degree'],
            field=data['field'],
            graduation_year=data['graduation_year'],
            gpa=data.get('gpa')
        )


class Resume:
    """Represents a complete resume/CV."""
    
    def __init__(self, resume_id: str, personal_info: Dict, 
                 experiences: List[Experience] = None, 
                 education: List[Education] = None,
                 skills: List[str] = None):
        self.resume_id = resume_id
        self.personal_info = personal_info
        self.experiences = experiences or []
        self.education = education or []
        self.skills = skills or []
        self.created_at = datetime.now().isoformat()
        self.updated_at = datetime.now().isoformat()
    
    def update_timestamp(self):
        """Update the last modified timestamp."""
        self.updated_at = datetime.now().isoformat()
    
    def add_experience(self, experience: Experience):
        """Add work experience to the resume."""
        self.experiences.append(experience)
        self.update_timestamp()
    
    def add_education(self, education: Education):
        """Add education to the resume."""
        self.education.append(education)
        self.update_timestamp()
    
    def add_skill(self, skill: str):
        """Add a skill to the resume."""
        if skill not in self.skills:
            self.skills.append(skill)
            self.update_timestamp()
    
    def to_dict(self) -> Dict:
        """Convert resume to dictionary."""
        return {
            'resume_id': self.resume_id,
            'personal_info': self.personal_info,
            'experiences': [exp.to_dict() for exp in self.experiences],
            'education': [edu.to_dict() for edu in self.education],
            'skills': self.skills,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Resume':
        """Create resume from dictionary."""
        resume = cls(
            resume_id=data['resume_id'],
            personal_info=data['personal_info'],
            skills=data.get('skills', [])
        )
        
        # Set timestamps
        resume.created_at = data.get('created_at', datetime.now().isoformat())
        resume.updated_at = data.get('updated_at', datetime.now().isoformat())
        
        # Add experiences
        for exp_data in data.get('experiences', []):
            resume.experiences.append(Experience.from_dict(exp_data))
        
        # Add education
        for edu_data in data.get('education', []):
            resume.education.append(Education.from_dict(edu_data))
        
        return resume
    
    def __str__(self) -> str:
        """String representation of the resume."""
        info = self.personal_info
        return f"Resume: {info.get('name', 'Unknown')} - {info.get('email', 'No email')}"