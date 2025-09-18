"""
Resume Manager - Core functionality for managing resumes.
"""

import json
import os
from typing import List, Dict, Optional
from models import Resume, Experience, Education


class ResumeManager:
    """Main class for managing resume operations."""
    
    def __init__(self, data_file: str = "resumes.json"):
        self.data_file = data_file
        self.resumes = {}
        self.load_data()
    
    def load_data(self):
        """Load resumes from JSON file."""
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    for resume_id, resume_data in data.items():
                        self.resumes[resume_id] = Resume.from_dict(resume_data)
            except (json.JSONDecodeError, FileNotFoundError):
                print(f"Warning: Could not load data from {self.data_file}")
                self.resumes = {}
    
    def save_data(self):
        """Save resumes to JSON file."""
        try:
            data = {resume_id: resume.to_dict() 
                   for resume_id, resume in self.resumes.items()}
            with open(self.data_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Error saving data: {e}")
    
    def create_resume(self, resume_id: str, personal_info: Dict) -> bool:
        """Create a new resume."""
        if resume_id in self.resumes:
            return False
        
        # Validate required personal information
        required_fields = ['name', 'email']
        for field in required_fields:
            if field not in personal_info or not personal_info[field]:
                raise ValueError(f"Required field '{field}' is missing")
        
        self.resumes[resume_id] = Resume(resume_id, personal_info)
        self.save_data()
        return True
    
    def get_resume(self, resume_id: str) -> Optional[Resume]:
        """Get a resume by ID."""
        return self.resumes.get(resume_id)
    
    def get_all_resumes(self) -> List[Resume]:
        """Get all resumes."""
        return list(self.resumes.values())
    
    def update_resume(self, resume_id: str, **kwargs) -> bool:
        """Update resume information."""
        if resume_id not in self.resumes:
            return False
        
        resume = self.resumes[resume_id]
        
        # Update personal info
        if 'personal_info' in kwargs:
            resume.personal_info.update(kwargs['personal_info'])
        
        # Update skills
        if 'skills' in kwargs:
            resume.skills = kwargs['skills']
        
        resume.update_timestamp()
        self.save_data()
        return True
    
    def delete_resume(self, resume_id: str) -> bool:
        """Delete a resume."""
        if resume_id in self.resumes:
            del self.resumes[resume_id]
            self.save_data()
            return True
        return False
    
    def add_experience(self, resume_id: str, company: str, position: str, 
                      start_date: str, end_date: str = None, 
                      description: str = "") -> bool:
        """Add work experience to a resume."""
        if resume_id not in self.resumes:
            return False
        
        experience = Experience(company, position, start_date, end_date, description)
        self.resumes[resume_id].add_experience(experience)
        self.save_data()
        return True
    
    def add_education(self, resume_id: str, institution: str, degree: str, 
                     field: str, graduation_year: int, gpa: float = None) -> bool:
        """Add education to a resume."""
        if resume_id not in self.resumes:
            return False
        
        education = Education(institution, degree, field, graduation_year, gpa)
        self.resumes[resume_id].add_education(education)
        self.save_data()
        return True
    
    def add_skill(self, resume_id: str, skill: str) -> bool:
        """Add a skill to a resume."""
        if resume_id not in self.resumes:
            return False
        
        self.resumes[resume_id].add_skill(skill)
        self.save_data()
        return True
    
    def search_resumes(self, query: str) -> List[Resume]:
        """Search resumes by name, email, skills, or company."""
        query = query.lower()
        results = []
        
        for resume in self.resumes.values():
            # Search in personal info
            if any(query in str(value).lower() 
                   for value in resume.personal_info.values()):
                results.append(resume)
                continue
            
            # Search in skills
            if any(query in skill.lower() for skill in resume.skills):
                results.append(resume)
                continue
            
            # Search in experiences
            if any(query in exp.company.lower() or query in exp.position.lower()
                   for exp in resume.experiences):
                results.append(resume)
                continue
            
            # Search in education
            if any(query in edu.institution.lower() or query in edu.field.lower()
                   for edu in resume.education):
                results.append(resume)
                continue
        
        return results
    
    def filter_by_skill(self, skill: str) -> List[Resume]:
        """Filter resumes by specific skill."""
        skill = skill.lower()
        return [resume for resume in self.resumes.values()
                if any(skill in s.lower() for s in resume.skills)]
    
    def filter_by_experience_years(self, min_years: int) -> List[Resume]:
        """Filter resumes by minimum years of experience."""
        results = []
        for resume in self.resumes.values():
            if len(resume.experiences) >= min_years:
                results.append(resume)
        return results
    
    def get_statistics(self) -> Dict:
        """Get statistics about the resume database."""
        total_resumes = len(self.resumes)
        total_skills = sum(len(resume.skills) for resume in self.resumes.values())
        
        # Most common skills
        skill_count = {}
        for resume in self.resumes.values():
            for skill in resume.skills:
                skill_count[skill] = skill_count.get(skill, 0) + 1
        
        most_common_skills = sorted(skill_count.items(), 
                                  key=lambda x: x[1], reverse=True)[:5]
        
        return {
            'total_resumes': total_resumes,
            'total_skills': total_skills,
            'average_skills_per_resume': total_skills / total_resumes if total_resumes > 0 else 0,
            'most_common_skills': most_common_skills
        }