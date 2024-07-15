import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function UserData() {
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();
  
    useEffect(() => {
      // Retrieve token from local storage
      const token = localStorage.getItem('token');
      if (!token) {
        // If token is not found, redirect to login page
        navigate('/signin');
      } else {
        // If token is found, fetch user data including events
        fetchUserData(token);
      }
    }, []);
  
    const fetchUserData = async (token) => {
      try {
        // Fetch user data including events from backend
        const response = await fetch("http://localhost:5000/dashboard", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!response.ok) {
          localStorage.setItem('isLoggedIn', false) //remove?
          throw new Error('Failed to fetch user data');
        }
        const userData = await response.json();
        setUserData(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Handle error (e.g., redirect to login page or display error message)
      }
    };
  
    return (
      <div>
        {userData ? (
          <div>
            <div></div>
            <h1 style={{ margin: '10px', fontSize: 'xxx-large', fontWeight: '500', fontFamily:'nunito', }}>Welcome, {userData.first_name}</h1>            
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    );
}

export default UserData