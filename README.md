# Gestor de Hojas de Vida (Resume Management System)

A comprehensive command-line resume management system written in Python. This system allows you to create, manage, search, and organize resumes/CVs efficiently.

## Features

- **Complete Resume Management**: Create, read, update, and delete resumes
- **Personal Information**: Store contact details and personal data
- **Work Experience**: Track employment history with detailed information
- **Education**: Manage educational background and achievements
- **Skills Management**: Add and organize technical and soft skills
- **Search & Filter**: Find resumes by name, skills, company, or any text
- **Data Persistence**: Automatic JSON-based storage
- **Statistics**: Generate insights about your resume database
- **Interactive CLI**: User-friendly command-line interface
- **Batch Operations**: Support for command-line arguments

## Installation

1. Clone the repository:
```bash
git clone https://github.com/JDav117/gestor-hojas-de-vida.git
cd gestor-hojas-de-vida
```

2. No external dependencies required! The system uses only Python standard library.

## Usage

### Interactive Mode (Recommended)

Launch the interactive menu:
```bash
python cli.py --interactive
# or simply
python cli.py
```

This will open a user-friendly menu where you can:
- Create new resumes
- View and search existing resumes
- Add experience, education, and skills
- Get database statistics

### Command Line Mode

You can also use direct commands:

```bash
# List all resumes
python cli.py --list

# View a specific resume
python cli.py --view john_doe

# Search resumes
python cli.py --search "Python developer"

# Delete a resume
python cli.py --delete john_doe

# Show statistics
python cli.py --stats
```

## Data Structure

### Resume Components

Each resume contains:
- **Personal Information**: Name, email, phone, address
- **Work Experience**: Company, position, dates, description
- **Education**: Institution, degree, field of study, graduation year, GPA
- **Skills**: List of technical and soft skills
- **Timestamps**: Creation and last modification dates

### Example Resume

```json
{
  "resume_id": "john_doe",
  "personal_info": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main St, City, State"
  },
  "experiences": [
    {
      "company": "Google",
      "position": "Software Engineer",
      "start_date": "2020-01",
      "end_date": "2023-12",
      "description": "Developed web applications using Python and JavaScript"
    }
  ],
  "education": [
    {
      "institution": "MIT",
      "degree": "Bachelor of Science",
      "field": "Computer Science",
      "graduation_year": 2019,
      "gpa": 3.8
    }
  ],
  "skills": ["Python", "JavaScript", "React", "Node.js"],
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-20T15:45:00"
}
```

## API Reference

### ResumeManager Class

Main class for managing resume operations:

```python
from resume_manager import ResumeManager

# Initialize manager
manager = ResumeManager("my_resumes.json")

# Create a resume
personal_info = {"name": "John Doe", "email": "john@example.com"}
manager.create_resume("john_doe", personal_info)

# Add experience
manager.add_experience("john_doe", "Google", "Engineer", "2020-01", "2023-12")

# Search resumes
results = manager.search_resumes("Python")
```

### Key Methods

- `create_resume(id, personal_info)`: Create a new resume
- `get_resume(id)`: Retrieve a specific resume
- `update_resume(id, **kwargs)`: Update resume information
- `delete_resume(id)`: Delete a resume
- `add_experience(id, ...)`: Add work experience
- `add_education(id, ...)`: Add education entry
- `add_skill(id, skill)`: Add a skill
- `search_resumes(query)`: Search across all resumes
- `filter_by_skill(skill)`: Filter by specific skill
- `get_statistics()`: Get database statistics

## Testing

Run the comprehensive test suite:

```bash
python -m unittest test_resume_manager.py -v
```

The test suite covers:
- Model creation and serialization
- CRUD operations
- Search and filter functionality
- Data persistence
- Error handling

## File Structure

```
gestor-hojas-de-vida/
├── README.md                 # This documentation
├── models.py                 # Data models (Resume, Experience, Education)
├── resume_manager.py         # Core management functionality
├── cli.py                    # Command-line interface
├── test_resume_manager.py    # Test suite
├── requirements.txt          # Dependencies (none needed)
└── resumes.json             # Data storage (created automatically)
```

## Example Workflow

1. **Create a new resume**:
```bash
python cli.py -i
# Select option 1, enter details
```

2. **Add work experience**:
```bash
# In interactive mode, select option 5
# Enter company, position, dates, description
```

3. **Add skills**:
```bash
# In interactive mode, select option 7
# Enter comma-separated skills
```

4. **Search and view**:
```bash
python cli.py --search "Python"
python cli.py --view john_doe
```

## Features in Detail

### Search Capabilities
- **Full-text search**: Search across names, emails, skills, companies
- **Case-insensitive**: Searches work regardless of capitalization
- **Partial matching**: Find resumes with partial keyword matches

### Data Validation
- Required fields enforcement (name, email)
- Data type validation for dates and numbers
- Duplicate skill prevention

### Statistics & Analytics
- Total resume count
- Skill distribution analysis
- Most common skills identification
- Average skills per resume

## Error Handling

The system includes comprehensive error handling:
- Invalid file operations
- Missing required fields
- Data corruption recovery
- Graceful degradation for file access issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For questions or issues, please open an issue on the GitHub repository.