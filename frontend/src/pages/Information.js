import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Information.css';

const Information = () => {
  const [formValues, setFormValues] = useState({
    username: '',
    age: '',
    location: '',
    contact: '',
    education: '',
    field: '',
    grades: '',
    employmentStatus: '',
    experience: '',
    technicalSkills: '',
    softSkills: '',
    strength: '',
    weakness: '',
    interests: '',
    disability: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formValues),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        navigate('/signin');
      } else {
        const errorData = await response.json();
        alert(errorData.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="form-container">
      <h1>Your Information</h1>
      <div className="form-section">
        <h2>Basic Information</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Username:
            <input
              className="input"
              type="text"
              name="username"
              value={formValues.name}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Age:
            <input
              className="input"
              type="number"
              name="age"
              value={formValues.age}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Location:
            <input
              className="input"
              type="text"
              name="location"
              value={formValues.location}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Contact Information:
            <input
              className="input"
              type="tel"
              name="contact"
              value={formValues.contact}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Highest Level of Education:
            <select
              className="select"
              name="education"
              value={formValues.education}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="High School">High School</option>
              <option value="Associate's Degree">Associate's Degree</option>
              <option value="Bachelor's Degree">Bachelor's Degree</option>
              <option value="Master's Degree">Master's Degree</option>
              <option value="Doctorate">Doctorate</option>
            </select>
          </label>
          <label>
            Field Of Study:
            <select
              className="select"
              name="field"
              value={formValues.field}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Engineering">Engineering</option>
              <option value="Business">Business</option>
              <option value="Arts">Arts</option>
              <option value="Sciences">Sciences</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <label>
            Grades/CGPA:
            <input
              className="input"
              type="text"
              name="grades"
              value={formValues.grades}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Current Employment Status:
            <select
              className="select"
              name="employmentStatus"
              value={formValues.employmentStatus}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="Employed">Employed</option>
              <option value="Not Employed">Not Employed</option>
            </select>
          </label>
          <label>
            Years of Experience:
            <input
              className="input"
              type="number"
              name="experience"
              value={formValues.experience}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Technical Skills:
            <input
              className="input"
              type="text"
              name="technicalSkills"
              value={formValues.technicalSkills}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Soft Skills:
            <input
              className="input"
              type="text"
              name="softSkills"
              value={formValues.softSkills}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Strength:
            <input
              className="input"
              type="text"
              name="strength"
              value={formValues.strength}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Weakness:
            <input
              className="input"
              type="text"
              name="weakness"
              value={formValues.weakness}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Interests:
            <input
              className="input"
              type="text"
              name="interests"
              value={formValues.interests}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Type of Disability:
            <input
              className="input"
              type="text"
              name="disability"
              value={formValues.disability}
              onChange={handleChange}
              required
            />
          </label>
          <button className='button' type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default Information;
