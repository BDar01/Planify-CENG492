import React, { useState, useEffect } from 'react';
import { Card, Dropdown, DropdownButton } from 'react-bootstrap';
import './habitcard.css'
const HabitCard = ({ habit, onDelete }) => {
  const [cardColor, setCardColor] = useState({ r: 255, g: 255, b: 255 }); // Default color to white in case of error
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to track if the menu is open

  const getRandomColor = () => {
    // Generate random values for red, green, and blue components within a range suitable for pastel colors
    const red = Math.floor(Math.random() * 156) + 100; // Range: 100-255
    const green = Math.floor(Math.random() * 156) + 100; // Range: 100-255
    const blue = Math.floor(Math.random() * 156) + 100; // Range: 100-255
    
    // Construct the color object
    return { r: red, g: green, b: blue };
  };

  useEffect(() => {
    // Retrieve and set the color from local storage if available
    try {
      const storedColor = localStorage.getItem(`habitEvent_${habit.id}`);
      if (storedColor) {
        const parsedColor = JSON.parse(storedColor);
        setCardColor(parsedColor);
      } else {
        const newColor = getRandomColor();
        localStorage.setItem(`habitEvent_${habit.id}`, JSON.stringify(newColor));
        setCardColor(newColor);
      }
    } catch (error) {
      console.error('Error parsing stored color:', error);
      // Fallback to a random color if there's an error
      const fallbackColor = getRandomColor();
      localStorage.setItem(`habitEvent_${habit.id}`, JSON.stringify(fallbackColor));
      setCardColor(fallbackColor);
    }
  }, [habit.id]);

  const cardStyle = {
    position: 'relative',
    width: '20rem',
    margin: '10px',
    padding: '20px',
    borderColor: `rgba(${cardColor.r}, ${cardColor.g}, ${cardColor.b}, 0.9)`,
    backgroundColor: `rgba(${cardColor.r}, ${cardColor.g}, ${cardColor.b}, 0.5)`,
  };

  const dropdownItems = [
    { label: 'Delete', action: onDelete },
    // You can add more dropdown items here if needed
  ];

  const handleMenuToggle = (isOpen) => {
    setIsMenuOpen(isOpen);
  };

  return (
    <Card style={cardStyle}>
      <Card.Body>
        <DropdownButton
          title=""
          variant="secondary"
          id={`dropdown-menu-${habit.id}`}
          className={isMenuOpen ? 'open-menu' : ''}
          onToggle={handleMenuToggle}
        >
          {dropdownItems.map((item, index) => (
            <Dropdown.Item key={index} onClick={item.action}>{item.label}</Dropdown.Item>
          ))}
        </DropdownButton>
        <Card.Title>{habit.name}</Card.Title>
        <Card.Text>Description: {habit.description}</Card.Text>
        <Card.Text>Duration: {habit.duration}</Card.Text>
        <Card.Text>Frequency: {habit.frequency}</Card.Text>
      </Card.Body>
    </Card>
  );
};

export default HabitCard;
