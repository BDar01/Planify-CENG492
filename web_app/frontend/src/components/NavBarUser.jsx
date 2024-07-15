import React, { useState } from "react";
import { Link } from "react-router-dom";

import logo from "../assets/logofinal.png";
import lock from "../assets/lock.png";
import close from "../assets/close.svg";
import hamburgerMenu from "../assets/hamburgerMenu.svg";

const NavbarUser = ({ handleLogout }) => {
  const [toggle, setToggle] = useState(false);

  const handleClick = () => setToggle(!toggle);

  return (
    <div className="w-full h-[75px] bg-white border-b px-2 header-bar">
      <div className="md:max-w-[1480px] max-w-[500px] m-auto w-full h-full flex justify-between items-center">
        <Link to="/">
          <img
            src={logo}
            className="h-[72px] w-[160px] nav-logo"
            style={{ left: "50%", position: "relative" }}
          />
        </Link>
        <div className="hidden md:flex items-center">
          <Link to="/">
            <button
              className="px-8 py-3 rounded-md bg-[#FF4700] text-white font-bold"
              onClick={handleLogout}
            >
              Log out
            </button>
          </Link>
        </div>

        <div className="md:hidden" onClick={handleClick}>
          <img src={toggle ? close : hamburgerMenu} />
        </div>
      </div>
    </div>
  );
};

export default NavbarUser;
