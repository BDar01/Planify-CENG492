import React, { useState } from "react";
import { Link } from "react-router-dom";

import logo from "../assets/logofinal.png";
import lock from "../assets/lock.png";
import close from "../assets/close.svg";
import hamburgerMenu from "../assets/hamburgerMenu.svg";

const NavbarGuest = () => {
  const [toggle, setToggle] = useState(false);

  const handleClick = () => setToggle(!toggle);

  return (
    <div className="w-full h-[75px] bg-white border-b px-2">
      <div className="md:max-w-[1480px] max-w-[500px] m-auto w-full h-full flex justify-between items-center header-bar">
        <Link to="/">
          <img src={logo} className="h-[72px] w-[160px] nav-logo" />
        </Link>
        <div className="hidden md:flex items-center">
          <ul className="flex gap-4">
            <li className="px-3 py-2 rounded-xl hover:bg-[#FF4700] hover:text-white">
              Home
            </li>
            <li className="px-3 py-2 rounded-xl hover:bg-[#FF4700] hover:text-white">
              About
            </li>
            <li className="px-3 py-2 rounded-xl hover:bg-[#FF4700] hover:text-white">
              Support
            </li>
            <li className="px-3 py-2 rounded-xl hover:bg-[#FF4700] hover:text-white">
              Pricing
            </li>
          </ul>
        </div>
        <div className="hidden md:flex">
          <Link to="/signin">
            <button className="flex justify-between items-center bg-transparent px-6 py-3 gap-2">
              <img src={lock} className="h-[30px] w-[25px]" />
              Login
            </button>
          </Link>
          <Link to="/signup">
            <button className="px-8 py-3 rounded-md bg-[#FF4700] text-white font-bold">
              Sign Up for Free
            </button>
          </Link>
        </div>
        <div className="md:hidden" onClick={handleClick}>
          <img src={toggle ? close : hamburgerMenu} />
        </div>
      </div>
      <div
        className={toggle ? "absolute z-10 p-4 bg-white w-full px-8" : "hidden"}
      >
        <ul>
          <li className="p-4 hover:bg-gray-100">Home</li>
          <li className="p-4 hover:bg-gray-100">About</li>
          <li className="p-4 hover:bg-gray-100">Support</li>
          <li className="p-4 hover:bg-gray-100">Pricing</li>

          <div className="flex flex-col my-4 gap-4">
            <Link to="/signin">
              <button className="border border-[208486] flex justify-center items-center bg-transparent px-6 gap-2 py-3">
                <img src={lock} className="h-[30px] w-[25px]" />
                Login
              </button>
            </Link>
            <Link to="/signup">
              <button className="px-8 py-3 rounded-md bg-[#FF4700] text-white font-bold">
                Sign Up for Free
              </button>
            </Link>
          </div>
        </ul>
      </div>
    </div>
  );
};

export default NavbarGuest;
