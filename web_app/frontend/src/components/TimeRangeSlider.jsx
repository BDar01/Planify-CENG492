import React, { useState, useEffect } from 'react';

function TimeRangeSlider({ activeHoursStart, activeHoursEnd, onActiveHoursChange }) {
    // Initialize state for the slider values using the props
    const [rangeOne, setRangeOne] = useState(activeHoursStart);
    const [rangeTwo, setRangeTwo] = useState(activeHoursEnd);

    // Effect to synchronize the slider state with prop changes
    useEffect(() => {
        setRangeOne(activeHoursStart);
        setRangeTwo(activeHoursEnd);
    }, [activeHoursStart, activeHoursEnd]);

    // Calculate the style of the included range
    const includedRangeStyle = {
        width: `${Math.abs(rangeTwo - rangeOne) / 24 * 100}%`,
        left: `${Math.min(rangeOne, rangeTwo) / 24 * 100}%`,
    };

    // Event handler for rangeOne change
    const handleRangeOneChange = (e) => {
        e.preventDefault();
        const value = Number(e.target.value);
        setRangeOne(value);
        // Call onActiveHoursChange with updated values
        onActiveHoursChange(value, rangeTwo);
    };

    // Event handler for rangeTwo change
    const handleRangeTwoChange = (e) => {
        e.preventDefault();
        const value = Number(e.target.value);
        setRangeTwo(value);
        // Call onActiveHoursChange with updated values
        onActiveHoursChange(rangeOne, value);
    };

    // Render the JSX
    return (
        <section className="range-slider container">
            {/* Output elements showing the values of rangeOne and rangeTwo */}
            <span className="output outputOne" style={{ left: `${rangeOne / 24 * 100}%` }}>{rangeOne}</span>
            <span className="output outputTwo" style={{ left: `${rangeTwo / 24 * 100}%` }}>{rangeTwo}</span>

            {/* Elements for full range and included range */}
            <span className="full-range"></span>
            <span className="incl-range" style={includedRangeStyle}></span>

            {/* Range input elements */}
            <input
                value={rangeOne}
                min="0"
                max="24"
                step="1"
                type="range"
                onChange={handleRangeOneChange}
            />
            <input
                value={rangeTwo}
                min="0"
                max="24"
                step="1"
                type="range"
                onChange={handleRangeTwoChange}
            />
        </section>
    );
}

export default TimeRangeSlider;
