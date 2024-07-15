import React, { useState, useEffect } from 'react';
import { Hero, NavbarGuest, SignIn, SignUp, Dashboard, Chatbot, Statistics, Habits } from './components';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import EventsList from './components/EventsList';
import NavbarUser from './components/NavBarUser';
import Sidebar from './components/Sidebar';
import StressnRecommendations from './components/StressnRecommendations';
import './style.css';

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loggedIn = localStorage.getItem("loggedin");
        setIsLoggedIn(loggedIn === "true");
        setIsLoading(false);

        const handleBeforeUnload = () => {
            // Uncomment the next line if you want to clear the login status when the tab is closed
            // localStorage.removeItem("loggedin");
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, []);

    const handleLogin = () => {
        localStorage.setItem("loggedin", "true");
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.clear();
        setIsLoggedIn(false);
    };

    if (isLoading) {
        return <div>Loading...</div>; // Or a spinner
    }

    return (
        <Router>
            <>
                {isLoggedIn ? <NavbarUser handleLogout={handleLogout} /> : <NavbarGuest />}
                {isLoggedIn ? (
                    <div className='include-sidebar'>
                        <Sidebar />
                        <Routes>
                            <Route path='/' element={<Hero />} />
                            <Route path='/signin' element={<SignIn handleLogin={handleLogin} />} />
                            <Route path='/signup' element={<SignUp />} />
                            <Route path='/dashboard' element={<Dashboard />} />
                            <Route path='/chatbot' element={<Chatbot />} />
                            <Route path='/Habits' element={<Habits />} />
                            <Route path='/EventsList' element={<EventsList />} />
                            <Route path='/Statistics' element={<Statistics />} />
                            <Route path='/StressnRecommendations' element={<StressnRecommendations />} />
                        </Routes>
                    </div>
                ) : (
                    <Routes>
                        <Route path='/' element={<Hero />} />
                        <Route path='/signin' element={<SignIn handleLogin={handleLogin} />} />
                        <Route path='/signup' element={<SignUp />} />
                        <Route path='/dashboard' element={<Dashboard />} />
                        <Route path='/chatbot' element={<Chatbot />} />
                        <Route path='/EventsList' element={<EventsList />} />
                        <Route path='/StressnRecommendations' element={<StressnRecommendations />} />
                    </Routes>
                )}
            </>
        </Router>
    );
};

export default App;
