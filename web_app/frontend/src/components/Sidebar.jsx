import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./indexsidebar.css";
import EventsList from "./EventsList";
import NavbarUser from "./NavBarUser";
import "./sidebar.css";
import StressnRecommendations from "./StressnRecommendations";
import Statistics from "./Statistics";

function Sidebar() {
  // Retrieve showNav state from localStorage or default to false if not found
  const [showNav, setShowNav] = useState(
    localStorage.getItem("showNav") === "true" || false
  );

  // Save showNav state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("showNav", showNav);

    const content = document.querySelector(".include-sidebar");
    const sidebar = document.querySelector(".l-navbar");
    const navLogo = document.querySelector(".nav-logo");
    if (content && sidebar) {
      if (showNav) {
        content.style.marginLeft = "250px";
        if (navLogo) {
          navLogo.style.marginLeft = "137px";
        }
      } else {
        content.style.marginLeft = "0";
        if (navLogo) {
          navLogo.style.marginLeft = "0";
        }
      }
    }
  }, [showNav]);

  // Function to handle logout
  const handleLogout = () => {
    // Clear user authentication tokens or session data from localStorage
    localStorage.clear();
    // Redirect to the beginning page (localhost)
    window.location.href = "/";
  };

  return (
    <div className="w-auto">
      <div
        className={`l-navbar${showNav ? " show" : ""}`}
        onMouseEnter={() => setShowNav(true)}
        onMouseLeave={() => setShowNav(false)}
      >
        <nav className="nav">
          <div>
            <div className="nav_logo">
              <i className="bi bi-calendar nav_logo-icon" />{" "}
              <span className="nav_logo-name">Planify</span>
            </div>
            <div className="nav_list">
              <a href="/dashboard" className="nav_link">
                <i className="bi bi-house-door nav_icon" />
                <span className="nav_name">Dashboard</span>
              </a>
              <a href="/EventsList" className="nav_link">
                <i className="bi bi-list-ul nav_icon" />
                <span className="nav_name">Task List</span>
              </a>
              <a href="/statistics" className="nav_link">
                <i className="bi bi-bar-chart nav_icon" />
                <span className="nav_name">Stats</span>
              </a>
              <a href="/Habits" className="nav_link">
                <i className="bi bi-check-square nav_icon" />
                <span className="nav_name">Habits</span>
              </a>
              <a href="/chatbot" className="nav_link">
                <i className="bi bi-chat nav_icon" />
                <span className="nav_name">Chatbot</span>
              </a>
              <a href="/StressnRecommendations" className="nav_link">
                <i className="bi bi-emoji-smile nav_icon" />
                <span className="nav_name">StressLevel&Recommendations</span>
              </a>
            </div>
          </div>
          <a
            href="#"
            onClick={handleLogout} // Add onClick event handler for logout
            className="nav_link"
            rel="noopener"
          >
            {/* Use '#' to prevent page reload */}
            <i className="bi bi-box-arrow-left nav_icon" />
            <span className="nav_name">SignOut</span>
          </a>
        </nav>
      </div>
      <div className={`body-area${showNav ? " body-pd" : ""}`}>
        {/* Your main content goes here */}
      </div>
    </div>
  );
}

export default Sidebar;
