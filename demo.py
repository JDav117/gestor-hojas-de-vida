#!/usr/bin/env python3
"""
Demo script to showcase the Resume Management System functionality.
Creates sample resumes and demonstrates various operations.
"""

from resume_manager import ResumeManager
import json


def create_demo_data():
    """Create sample resume data for demonstration."""
    manager = ResumeManager("demo_resumes.json")
    
    print("Creating demo data...")
    
    # Resume 1: Software Developer
    manager.create_resume("john_doe", {
        'name': 'John Doe',
        'email': 'john.doe@email.com',
        'phone': '+1-555-0123',
        'address': '123 Tech Street, San Francisco, CA'
    })
    
    manager.add_experience("john_doe", "Google", "Senior Software Engineer", 
                          "2021-03", "2024-01", 
                          "Led development of cloud-based applications using Python and JavaScript")
    
    manager.add_experience("john_doe", "Microsoft", "Software Engineer", 
                          "2019-06", "2021-02", 
                          "Developed web applications and APIs using .NET and React")
    
    manager.add_education("john_doe", "Stanford University", "Master of Science", 
                         "Computer Science", 2019, 3.8)
    
    manager.add_education("john_doe", "UC Berkeley", "Bachelor of Science", 
                         "Computer Engineering", 2017, 3.6)
    
    for skill in ["Python", "JavaScript", "React", "Node.js", "AWS", "Docker", "Git"]:
        manager.add_skill("john_doe", skill)
    
    # Resume 2: Data Scientist
    manager.create_resume("jane_smith", {
        'name': 'Jane Smith',
        'email': 'jane.smith@email.com',
        'phone': '+1-555-0456',
        'address': '456 Data Lane, New York, NY'
    })
    
    manager.add_experience("jane_smith", "Netflix", "Senior Data Scientist", 
                          "2020-08", None, 
                          "Applied machine learning to recommendation systems and user behavior analysis")
    
    manager.add_experience("jane_smith", "Uber", "Data Scientist", 
                          "2018-05", "2020-07", 
                          "Built predictive models for demand forecasting and pricing optimization")
    
    manager.add_education("jane_smith", "MIT", "PhD", 
                         "Data Science", 2018, 3.9)
    
    for skill in ["Python", "R", "SQL", "TensorFlow", "PyTorch", "Pandas", "Scikit-learn", "Tableau"]:
        manager.add_skill("jane_smith", skill)
    
    # Resume 3: Frontend Developer
    manager.create_resume("alex_johnson", {
        'name': 'Alex Johnson',
        'email': 'alex.johnson@email.com',
        'phone': '+1-555-0789',
        'address': '789 Frontend Ave, Austin, TX'
    })
    
    manager.add_experience("alex_johnson", "Airbnb", "Frontend Developer", 
                          "2022-01", None, 
                          "Developed responsive user interfaces using React and Vue.js")
    
    manager.add_experience("alex_johnson", "Spotify", "Junior Frontend Developer", 
                          "2020-09", "2021-12", 
                          "Created interactive music player components and user dashboards")
    
    manager.add_education("alex_johnson", "Georgia Tech", "Bachelor of Science", 
                         "Computer Science", 2020, 3.4)
    
    for skill in ["JavaScript", "React", "Vue.js", "HTML5", "CSS3", "SASS", "Webpack", "TypeScript"]:
        manager.add_skill("alex_johnson", skill)
    
    print("Demo data created successfully!")
    return manager


def demonstrate_functionality(manager):
    """Demonstrate various system capabilities."""
    print("\n" + "="*60)
    print("RESUME MANAGEMENT SYSTEM DEMONSTRATION")
    print("="*60)
    
    # Show all resumes
    print("\n1. ALL RESUMES IN DATABASE:")
    print("-" * 30)
    resumes = manager.get_all_resumes()
    for resume in resumes:
        print(f"  • {resume.personal_info['name']} ({resume.resume_id}) - {resume.personal_info['email']}")
    
    # Show statistics
    print("\n2. DATABASE STATISTICS:")
    print("-" * 30)
    stats = manager.get_statistics()
    print(f"  Total Resumes: {stats['total_resumes']}")
    print(f"  Total Skills: {stats['total_skills']}")
    print(f"  Average Skills per Resume: {stats['average_skills_per_resume']:.1f}")
    print("  Most Common Skills:")
    for skill, count in stats['most_common_skills'][:5]:
        print(f"    - {skill}: {count} resumes")
    
    # Demonstrate search
    print("\n3. SEARCH DEMONSTRATION:")
    print("-" * 30)
    
    # Search by skill
    python_devs = manager.search_resumes("Python")
    print(f"  Resumes with 'Python': {len(python_devs)} found")
    for resume in python_devs:
        print(f"    - {resume.personal_info['name']}")
    
    # Search by company
    google_exp = manager.search_resumes("Google")
    print(f"  Resumes with 'Google' experience: {len(google_exp)} found")
    for resume in google_exp:
        print(f"    - {resume.personal_info['name']}")
    
    # Filter by specific skill
    print("\n4. SKILL FILTERING:")
    print("-" * 30)
    react_devs = manager.filter_by_skill("React")
    print(f"  Developers with React skills: {len(react_devs)} found")
    for resume in react_devs:
        print(f"    - {resume.personal_info['name']}")
    
    # Show a detailed resume
    print("\n5. DETAILED RESUME VIEW:")
    print("-" * 30)
    sample_resume = manager.get_resume("john_doe")
    if sample_resume:
        print(f"\nResume ID: {sample_resume.resume_id}")
        print(f"Name: {sample_resume.personal_info['name']}")
        print(f"Email: {sample_resume.personal_info['email']}")
        print(f"Skills: {', '.join(sample_resume.skills[:5])}...")
        print(f"Experience: {len(sample_resume.experiences)} positions")
        print(f"Education: {len(sample_resume.education)} degrees")
    
    print("\n" + "="*60)
    print("DEMONSTRATION COMPLETE")
    print("="*60)
    print("\nTo explore more features, run: python cli.py --interactive")
    print("To view the demo data file: cat demo_resumes.json")


def main():
    """Main demo function."""
    manager = create_demo_data()
    demonstrate_functionality(manager)


if __name__ == '__main__':
    main()