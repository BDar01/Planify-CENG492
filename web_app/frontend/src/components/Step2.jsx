import React from 'react'
import './signup.css'
function Step2({formData,handleChange}) {
  return (
    <div className="step2">
			
			<div>
				<h2>What is your role?</h2>
				<label className='radio-option'>
					<input
						type="radio"
						name="role"
						value="student"
						onChange={handleChange}
					/>
					<span>Student</span>
				</label>
				<label className='radio-option'>
					<input
						type="radio"
						name="role"
						value="professional"
						onChange={handleChange}
					/>
					<span>Professional</span>
				</label>
			</div>
			<div>
				<h2>What brings you to planify?</h2>
				<label className='radio-option'>
					<input
						type="radio"
						name="usage"
						value="personal"
						onChange={handleChange}
					/>
					<span>Personal Use</span>
				</label>
				<label className='radio-option'>
					<input
						type="radio"
						name="usage"
						value="team"
						onChange={handleChange}
					/>
					<span>Team Use</span>
				</label>
			</div>
		</div>
  )
}

export default Step2