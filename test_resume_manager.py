"""
Test suite for the Resume Management System.
"""

import unittest
import os
import tempfile
import json
from resume_manager import ResumeManager
from models import Resume, Experience, Education


class TestModels(unittest.TestCase):
    """Test cases for data models."""
    
    def test_experience_creation(self):
        """Test experience creation and serialization."""
        exp = Experience("Google", "Software Engineer", "2020-01", "2023-12", "Developed web applications")
        
        self.assertEqual(exp.company, "Google")
        self.assertEqual(exp.position, "Software Engineer")
        self.assertEqual(exp.start_date, "2020-01")
        self.assertEqual(exp.end_date, "2023-12")
        self.assertEqual(exp.description, "Developed web applications")
        
        # Test serialization
        exp_dict = exp.to_dict()
        exp_restored = Experience.from_dict(exp_dict)
        
        self.assertEqual(exp.company, exp_restored.company)
        self.assertEqual(exp.position, exp_restored.position)
    
    def test_education_creation(self):
        """Test education creation and serialization."""
        edu = Education("MIT", "Bachelor", "Computer Science", 2020, 3.8)
        
        self.assertEqual(edu.institution, "MIT")
        self.assertEqual(edu.degree, "Bachelor")
        self.assertEqual(edu.field, "Computer Science")
        self.assertEqual(edu.graduation_year, 2020)
        self.assertEqual(edu.gpa, 3.8)
        
        # Test serialization
        edu_dict = edu.to_dict()
        edu_restored = Education.from_dict(edu_dict)
        
        self.assertEqual(edu.institution, edu_restored.institution)
        self.assertEqual(edu.gpa, edu_restored.gpa)
    
    def test_resume_creation(self):
        """Test resume creation and manipulation."""
        personal_info = {
            'name': 'John Doe',
            'email': 'john@example.com',
            'phone': '+1234567890'
        }
        
        resume = Resume("john_doe", personal_info)
        
        self.assertEqual(resume.resume_id, "john_doe")
        self.assertEqual(resume.personal_info['name'], 'John Doe')
        self.assertEqual(len(resume.experiences), 0)
        self.assertEqual(len(resume.education), 0)
        self.assertEqual(len(resume.skills), 0)
        
        # Test adding components
        exp = Experience("Google", "Developer", "2020-01")
        resume.add_experience(exp)
        self.assertEqual(len(resume.experiences), 1)
        
        edu = Education("MIT", "Bachelor", "CS", 2020)
        resume.add_education(edu)
        self.assertEqual(len(resume.education), 1)
        
        resume.add_skill("Python")
        resume.add_skill("JavaScript")
        self.assertEqual(len(resume.skills), 2)
        
        # Test skill deduplication
        resume.add_skill("Python")  # Should not add duplicate
        self.assertEqual(len(resume.skills), 2)
    
    def test_resume_serialization(self):
        """Test resume serialization and deserialization."""
        personal_info = {'name': 'Jane Doe', 'email': 'jane@example.com'}
        resume = Resume("jane_doe", personal_info)
        
        resume.add_skill("Python")
        resume.add_experience(Experience("Apple", "Engineer", "2021-01"))
        resume.add_education(Education("Stanford", "Master", "AI", 2021))
        
        # Serialize and deserialize
        resume_dict = resume.to_dict()
        resume_restored = Resume.from_dict(resume_dict)
        
        self.assertEqual(resume.resume_id, resume_restored.resume_id)
        self.assertEqual(resume.personal_info, resume_restored.personal_info)
        self.assertEqual(len(resume.skills), len(resume_restored.skills))
        self.assertEqual(len(resume.experiences), len(resume_restored.experiences))
        self.assertEqual(len(resume.education), len(resume_restored.education))


class TestResumeManager(unittest.TestCase):
    """Test cases for ResumeManager."""
    
    def setUp(self):
        """Set up test environment."""
        # Create a temporary file for testing
        self.temp_file = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json')
        self.temp_file.close()
        self.manager = ResumeManager(self.temp_file.name)
    
    def tearDown(self):
        """Clean up test environment."""
        # Remove temporary file
        if os.path.exists(self.temp_file.name):
            os.unlink(self.temp_file.name)
    
    def test_create_resume(self):
        """Test resume creation."""
        personal_info = {'name': 'Test User', 'email': 'test@example.com'}
        
        # Test successful creation
        result = self.manager.create_resume("test1", personal_info)
        self.assertTrue(result)
        
        # Test duplicate creation
        result = self.manager.create_resume("test1", personal_info)
        self.assertFalse(result)
        
        # Test missing required fields
        with self.assertRaises(ValueError):
            self.manager.create_resume("test2", {'name': 'Test'})  # Missing email
    
    def test_get_resume(self):
        """Test resume retrieval."""
        personal_info = {'name': 'Test User', 'email': 'test@example.com'}
        self.manager.create_resume("test1", personal_info)
        
        # Test existing resume
        resume = self.manager.get_resume("test1")
        self.assertIsNotNone(resume)
        self.assertEqual(resume.resume_id, "test1")
        
        # Test non-existing resume
        resume = self.manager.get_resume("nonexistent")
        self.assertIsNone(resume)
    
    def test_update_resume(self):
        """Test resume updates."""
        personal_info = {'name': 'Test User', 'email': 'test@example.com'}
        self.manager.create_resume("test1", personal_info)
        
        # Test successful update
        result = self.manager.update_resume("test1", 
                                          personal_info={'phone': '+1234567890'},
                                          skills=['Python', 'Java'])
        self.assertTrue(result)
        
        resume = self.manager.get_resume("test1")
        self.assertEqual(resume.personal_info['phone'], '+1234567890')
        self.assertEqual(len(resume.skills), 2)
        
        # Test update non-existing resume
        result = self.manager.update_resume("nonexistent", skills=['Python'])
        self.assertFalse(result)
    
    def test_delete_resume(self):
        """Test resume deletion."""
        personal_info = {'name': 'Test User', 'email': 'test@example.com'}
        self.manager.create_resume("test1", personal_info)
        
        # Verify resume exists
        self.assertIsNotNone(self.manager.get_resume("test1"))
        
        # Test successful deletion
        result = self.manager.delete_resume("test1")
        self.assertTrue(result)
        self.assertIsNone(self.manager.get_resume("test1"))
        
        # Test deleting non-existing resume
        result = self.manager.delete_resume("nonexistent")
        self.assertFalse(result)
    
    def test_add_experience(self):
        """Test adding work experience."""
        personal_info = {'name': 'Test User', 'email': 'test@example.com'}
        self.manager.create_resume("test1", personal_info)
        
        # Test successful addition
        result = self.manager.add_experience("test1", "Google", "Engineer", "2020-01", "2023-12", "Worked on search")
        self.assertTrue(result)
        
        resume = self.manager.get_resume("test1")
        self.assertEqual(len(resume.experiences), 1)
        self.assertEqual(resume.experiences[0].company, "Google")
        
        # Test adding to non-existing resume
        result = self.manager.add_experience("nonexistent", "Apple", "Developer", "2020-01")
        self.assertFalse(result)
    
    def test_add_education(self):
        """Test adding education."""
        personal_info = {'name': 'Test User', 'email': 'test@example.com'}
        self.manager.create_resume("test1", personal_info)
        
        # Test successful addition
        result = self.manager.add_education("test1", "MIT", "Bachelor", "Computer Science", 2020, 3.8)
        self.assertTrue(result)
        
        resume = self.manager.get_resume("test1")
        self.assertEqual(len(resume.education), 1)
        self.assertEqual(resume.education[0].institution, "MIT")
        
        # Test adding to non-existing resume
        result = self.manager.add_education("nonexistent", "Stanford", "Master", "AI", 2021)
        self.assertFalse(result)
    
    def test_add_skill(self):
        """Test adding skills."""
        personal_info = {'name': 'Test User', 'email': 'test@example.com'}
        self.manager.create_resume("test1", personal_info)
        
        # Test successful addition
        result = self.manager.add_skill("test1", "Python")
        self.assertTrue(result)
        
        resume = self.manager.get_resume("test1")
        self.assertEqual(len(resume.skills), 1)
        self.assertIn("Python", resume.skills)
        
        # Test adding to non-existing resume
        result = self.manager.add_skill("nonexistent", "Java")
        self.assertFalse(result)
    
    def test_search_resumes(self):
        """Test resume search functionality."""
        # Create test resumes
        self.manager.create_resume("john", {'name': 'John Doe', 'email': 'john@example.com'})
        self.manager.create_resume("jane", {'name': 'Jane Smith', 'email': 'jane@example.com'})
        
        self.manager.add_skill("john", "Python")
        self.manager.add_skill("jane", "Java")
        self.manager.add_experience("john", "Google", "Engineer", "2020-01")
        
        # Test search by name
        results = self.manager.search_resumes("John")
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].resume_id, "john")
        
        # Test search by skill
        results = self.manager.search_resumes("Python")
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].resume_id, "john")
        
        # Test search by company
        results = self.manager.search_resumes("Google")
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].resume_id, "john")
        
        # Test case insensitive search
        results = self.manager.search_resumes("python")
        self.assertEqual(len(results), 1)
        
        # Test no results
        results = self.manager.search_resumes("nonexistent")
        self.assertEqual(len(results), 0)
    
    def test_filter_by_skill(self):
        """Test filtering by skill."""
        self.manager.create_resume("dev1", {'name': 'Dev One', 'email': 'dev1@example.com'})
        self.manager.create_resume("dev2", {'name': 'Dev Two', 'email': 'dev2@example.com'})
        
        self.manager.add_skill("dev1", "Python")
        self.manager.add_skill("dev1", "JavaScript")
        self.manager.add_skill("dev2", "Java")
        self.manager.add_skill("dev2", "Python")
        
        # Test filtering by Python
        results = self.manager.filter_by_skill("Python")
        self.assertEqual(len(results), 2)
        
        # Test filtering by JavaScript
        results = self.manager.filter_by_skill("JavaScript")
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].resume_id, "dev1")
        
        # Test case insensitive filtering
        results = self.manager.filter_by_skill("python")
        self.assertEqual(len(results), 2)
    
    def test_statistics(self):
        """Test statistics generation."""
        # Initially no resumes
        stats = self.manager.get_statistics()
        self.assertEqual(stats['total_resumes'], 0)
        self.assertEqual(stats['total_skills'], 0)
        
        # Add some resumes
        self.manager.create_resume("dev1", {'name': 'Dev One', 'email': 'dev1@example.com'})
        self.manager.create_resume("dev2", {'name': 'Dev Two', 'email': 'dev2@example.com'})
        
        self.manager.add_skill("dev1", "Python")
        self.manager.add_skill("dev1", "JavaScript")
        self.manager.add_skill("dev2", "Python")
        self.manager.add_skill("dev2", "Java")
        
        stats = self.manager.get_statistics()
        self.assertEqual(stats['total_resumes'], 2)
        self.assertEqual(stats['total_skills'], 4)
        self.assertEqual(stats['average_skills_per_resume'], 2.0)
        
        # Check most common skills
        most_common = dict(stats['most_common_skills'])
        self.assertEqual(most_common['Python'], 2)
    
    def test_data_persistence(self):
        """Test data persistence across manager instances."""
        # Create and save data
        personal_info = {'name': 'Test User', 'email': 'test@example.com'}
        self.manager.create_resume("test1", personal_info)
        self.manager.add_skill("test1", "Python")
        
        # Create new manager instance with same file
        new_manager = ResumeManager(self.temp_file.name)
        
        # Verify data was loaded
        resume = new_manager.get_resume("test1")
        self.assertIsNotNone(resume)
        self.assertEqual(resume.personal_info['name'], 'Test User')
        self.assertIn("Python", resume.skills)


if __name__ == '__main__':
    unittest.main()