import React from 'react'
import TimeRangeSlider from './TimeRangeSlider'
function Step3({ formData, handleChange, onActiveHoursChange }) {
  return (
<div className="step3">
        <div>
            <h2>Would you like to prioritize a balanced schedule or a more time efficient one?</h2>
            <label className='radio-option'>
                <input
                    type="radio"
                    name="balanced"
                    value="True"
                    checked={formData.balanced === "True"}
                    onChange={handleChange}
                />
                <span>Balanced</span>
            </label>
            <label className='radio-option'>
                <input
                    type="radio"
                    name="balanced"
                    value="False"
                    checked={formData.balanced === "False"}
                    onChange={handleChange}
                />
                <span>Time efficient</span>
            </label>
        </div>
        <div>
            <h2>Could you give us your active hours?</h2>
            <div className="slidersection">
                <TimeRangeSlider
                    activeHoursStart={formData.activeHoursStart}
                    activeHoursEnd={formData.activeHoursEnd}
                    onActiveHoursChange={onActiveHoursChange}
                />
            </div>
        </div>
    </div>
      )
}

export default Step3

