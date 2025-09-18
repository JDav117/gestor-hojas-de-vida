#!/usr/bin/env python3
"""
Command Line Interface for Resume Management System.
"""

import argparse
import sys
from resume_manager import ResumeManager
from models import Resume


def create_resume_interactive(manager: ResumeManager):
    """Interactive resume creation."""
    print("\n=== Create New Resume ===")
    
    resume_id = input("Enter Resume ID: ").strip()
    if not resume_id:
        print("Resume ID cannot be empty.")
        return
    
    if manager.get_resume(resume_id):
        print(f"Resume with ID '{resume_id}' already exists.")
        return
    
    print("Enter personal information:")
    name = input("Full Name: ").strip()
    email = input("Email: ").strip()
    phone = input("Phone (optional): ").strip()
    address = input("Address (optional): ").strip()
    
    if not name or not email:
        print("Name and email are required.")
        return
    
    personal_info = {
        'name': name,
        'email': email
    }
    
    if phone:
        personal_info['phone'] = phone
    if address:
        personal_info['address'] = address
    
    try:
        if manager.create_resume(resume_id, personal_info):
            print(f"Resume '{resume_id}' created successfully!")
        else:
            print("Failed to create resume.")
    except ValueError as e:
        print(f"Error: {e}")


def add_experience_interactive(manager: ResumeManager):
    """Interactive experience addition."""
    print("\n=== Add Work Experience ===")
    
    resume_id = input("Enter Resume ID: ").strip()
    if not manager.get_resume(resume_id):
        print(f"Resume '{resume_id}' not found.")
        return
    
    company = input("Company: ").strip()
    position = input("Position: ").strip()
    start_date = input("Start Date (YYYY-MM): ").strip()
    end_date = input("End Date (YYYY-MM, or 'current'): ").strip()
    description = input("Description (optional): ").strip()
    
    if not company or not position or not start_date:
        print("Company, position, and start date are required.")
        return
    
    if end_date.lower() == 'current':
        end_date = None
    
    if manager.add_experience(resume_id, company, position, start_date, end_date, description):
        print("Experience added successfully!")
    else:
        print("Failed to add experience.")


def add_education_interactive(manager: ResumeManager):
    """Interactive education addition."""
    print("\n=== Add Education ===")
    
    resume_id = input("Enter Resume ID: ").strip()
    if not manager.get_resume(resume_id):
        print(f"Resume '{resume_id}' not found.")
        return
    
    institution = input("Institution: ").strip()
    degree = input("Degree: ").strip()
    field = input("Field of Study: ").strip()
    graduation_year = input("Graduation Year: ").strip()
    gpa = input("GPA (optional): ").strip()
    
    if not institution or not degree or not field or not graduation_year:
        print("Institution, degree, field, and graduation year are required.")
        return
    
    try:
        graduation_year = int(graduation_year)
        gpa = float(gpa) if gpa else None
    except ValueError:
        print("Invalid graduation year or GPA format.")
        return
    
    if manager.add_education(resume_id, institution, degree, field, graduation_year, gpa):
        print("Education added successfully!")
    else:
        print("Failed to add education.")


def add_skill_interactive(manager: ResumeManager):
    """Interactive skill addition."""
    print("\n=== Add Skill ===")
    
    resume_id = input("Enter Resume ID: ").strip()
    if not manager.get_resume(resume_id):
        print(f"Resume '{resume_id}' not found.")
        return
    
    skills = input("Enter skills (comma-separated): ").strip()
    if not skills:
        print("Skills cannot be empty.")
        return
    
    skill_list = [skill.strip() for skill in skills.split(',')]
    added_count = 0
    
    for skill in skill_list:
        if skill and manager.add_skill(resume_id, skill):
            added_count += 1
    
    print(f"Added {added_count} skills successfully!")


def display_resume(resume: Resume):
    """Display a resume in a formatted way."""
    print(f"\n{'='*50}")
    print(f"Resume ID: {resume.resume_id}")
    print(f"{'='*50}")
    
    # Personal Information
    print("\nPERSONAL INFORMATION:")
    for key, value in resume.personal_info.items():
        print(f"  {key.title()}: {value}")
    
    # Skills
    if resume.skills:
        print("\nSKILLS:")
        print(f"  {', '.join(resume.skills)}")
    
    # Work Experience
    if resume.experiences:
        print("\nWORK EXPERIENCE:")
        for i, exp in enumerate(resume.experiences, 1):
            print(f"  {i}. {exp.position} at {exp.company}")
            print(f"     Period: {exp.start_date} - {exp.end_date or 'Current'}")
            if exp.description:
                print(f"     Description: {exp.description}")
    
    # Education
    if resume.education:
        print("\nEDUCATION:")
        for i, edu in enumerate(resume.education, 1):
            print(f"  {i}. {edu.degree} in {edu.field}")
            print(f"     Institution: {edu.institution}")
            print(f"     Graduation Year: {edu.graduation_year}")
            if edu.gpa:
                print(f"     GPA: {edu.gpa}")
    
    print(f"\nCreated: {resume.created_at}")
    print(f"Updated: {resume.updated_at}")


def list_resumes(manager: ResumeManager):
    """List all resumes."""
    resumes = manager.get_all_resumes()
    if not resumes:
        print("No resumes found.")
        return
    
    print(f"\n=== All Resumes ({len(resumes)}) ===")
    for resume in resumes:
        print(f"ID: {resume.resume_id} | Name: {resume.personal_info.get('name', 'Unknown')} | Email: {resume.personal_info.get('email', 'No email')}")


def view_resume(manager: ResumeManager):
    """View a specific resume."""
    resume_id = input("Enter Resume ID to view: ").strip()
    resume = manager.get_resume(resume_id)
    
    if resume:
        display_resume(resume)
    else:
        print(f"Resume '{resume_id}' not found.")


def search_resumes(manager: ResumeManager):
    """Search resumes."""
    query = input("Enter search query: ").strip()
    if not query:
        print("Search query cannot be empty.")
        return
    
    results = manager.search_resumes(query)
    if results:
        print(f"\n=== Search Results ({len(results)}) ===")
        for resume in results:
            print(f"ID: {resume.resume_id} | Name: {resume.personal_info.get('name', 'Unknown')} | Email: {resume.personal_info.get('email', 'No email')}")
    else:
        print("No resumes found matching your query.")


def delete_resume(manager: ResumeManager):
    """Delete a resume."""
    resume_id = input("Enter Resume ID to delete: ").strip()
    
    if not manager.get_resume(resume_id):
        print(f"Resume '{resume_id}' not found.")
        return
    
    confirm = input(f"Are you sure you want to delete resume '{resume_id}'? (y/N): ").strip().lower()
    if confirm == 'y':
        if manager.delete_resume(resume_id):
            print(f"Resume '{resume_id}' deleted successfully!")
        else:
            print("Failed to delete resume.")
    else:
        print("Deletion cancelled.")


def show_statistics(manager: ResumeManager):
    """Show database statistics."""
    stats = manager.get_statistics()
    
    print("\n=== Database Statistics ===")
    print(f"Total Resumes: {stats['total_resumes']}")
    print(f"Total Skills: {stats['total_skills']}")
    print(f"Average Skills per Resume: {stats['average_skills_per_resume']:.2f}")
    
    if stats['most_common_skills']:
        print("\nMost Common Skills:")
        for skill, count in stats['most_common_skills']:
            print(f"  {skill}: {count} resumes")


def interactive_menu():
    """Main interactive menu."""
    manager = ResumeManager()
    
    while True:
        print("\n" + "="*50)
        print("        RESUME MANAGEMENT SYSTEM")
        print("="*50)
        print("1. Create Resume")
        print("2. List All Resumes")
        print("3. View Resume")
        print("4. Search Resumes")
        print("5. Add Experience")
        print("6. Add Education")
        print("7. Add Skills")
        print("8. Delete Resume")
        print("9. Show Statistics")
        print("0. Exit")
        print("="*50)
        
        choice = input("Select an option: ").strip()
        
        if choice == '1':
            create_resume_interactive(manager)
        elif choice == '2':
            list_resumes(manager)
        elif choice == '3':
            view_resume(manager)
        elif choice == '4':
            search_resumes(manager)
        elif choice == '5':
            add_experience_interactive(manager)
        elif choice == '6':
            add_education_interactive(manager)
        elif choice == '7':
            add_skill_interactive(manager)
        elif choice == '8':
            delete_resume(manager)
        elif choice == '9':
            show_statistics(manager)
        elif choice == '0':
            print("Thank you for using Resume Management System!")
            break
        else:
            print("Invalid option. Please try again.")


def main():
    """Main function with command line argument parsing."""
    parser = argparse.ArgumentParser(description='Resume Management System')
    parser.add_argument('--interactive', '-i', action='store_true',
                       help='Run in interactive mode')
    parser.add_argument('--create', type=str, metavar='ID',
                       help='Create a new resume with given ID')
    parser.add_argument('--list', action='store_true',
                       help='List all resumes')
    parser.add_argument('--view', type=str, metavar='ID',
                       help='View resume with given ID')
    parser.add_argument('--search', type=str, metavar='QUERY',
                       help='Search resumes')
    parser.add_argument('--delete', type=str, metavar='ID',
                       help='Delete resume with given ID')
    parser.add_argument('--stats', action='store_true',
                       help='Show database statistics')
    
    args = parser.parse_args()
    
    if args.interactive or len(sys.argv) == 1:
        interactive_menu()
        return
    
    manager = ResumeManager()
    
    if args.list:
        list_resumes(manager)
    elif args.view:
        resume = manager.get_resume(args.view)
        if resume:
            display_resume(resume)
        else:
            print(f"Resume '{args.view}' not found.")
    elif args.search:
        results = manager.search_resumes(args.search)
        if results:
            print(f"Found {len(results)} resumes:")
            for resume in results:
                print(f"  {resume.resume_id}: {resume.personal_info.get('name', 'Unknown')}")
        else:
            print("No resumes found.")
    elif args.delete:
        if manager.delete_resume(args.delete):
            print(f"Resume '{args.delete}' deleted successfully!")
        else:
            print(f"Resume '{args.delete}' not found.")
    elif args.stats:
        show_statistics(manager)
    elif args.create:
        print("For creating resumes, please use interactive mode: python cli.py --interactive")


if __name__ == '__main__':
    main()