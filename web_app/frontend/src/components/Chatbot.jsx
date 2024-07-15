import React, { useState, useEffect } from 'react';
import ResponseWindow from './ResponseWindow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';
import './Chatbot.css'
const Chatbot = () => {
  // const [textInput, setTextInput] = useState('');
  // const [chatHistory, setChatHistory] = useState([]);
  // const [responseMessage, setResponseMessage] = useState('');
  const [textInput, setTextInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [responseMessage, setResponseMessage] = useState('');
  // const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    // Retrieve token from local storage
    const token = localStorage.getItem('token');
    if (!token) {
      // If token is not found, redirect to login page
      navigate('/signin');
    } else {
      console.log(token);
    }
  }, []);

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!textInput) return;

    const newMessage = { sender: 'user', text: textInput };
    setChatHistory((prevChatHistory) => [...prevChatHistory, newMessage]);
    setTextInput('');
    try {
      if (textInput) {
        // const newMessage = { sender: 'user', text: textInput };
        // setChatHistory([...chatHistory, newMessage]);
        console.log(chatHistory)

        const input_data = { textInput };
        console.log(input_data)
        console.log("posting to backend")
        const response = await fetch('http://localhost:5000/addEventChatbot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(input_data),
        });

        const data = await response.json();
        // console.log("whats the response")
        // console.log(data.response)
        setResponseMessage(data.response);
        // setChatHistory([...chatHistory, { sender: 'bot', text: data.response }]);
        const botMessage = { sender: 'bot', text: data.response };
        setChatHistory((prevChatHistory) => [...prevChatHistory, botMessage]);
        console.log(chatHistory)
      }
    } catch (error) {
      console.error('Error sending input:', error);
    }
  };

  const handleRecordAudio = async (e) => {
    e.preventDefault();
    try {
      const input_data = { audioInput: true };

      const response = await fetch('http://localhost:5000/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(input_data),
      });

      const data = await response.json();
      setResponseMessage(data.response);
      const botMessage = { sender: 'bot', text: data.response };
      setChatHistory((prevChatHistory) => [...prevChatHistory, botMessage]);
      console.log(chatHistory)
      // setChatHistory([...chatHistory, { sender: 'bot', text: data.response }]);
    } catch (error) {
      console.error('Error sending input:', error);
    }
  };

  return (
    <div className="chatbot-container">
      <div className=" flex flex-col h-full bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="chatbot-head flex items-center justify-center p-4">
          <i className="bi bi-chat-dots text-4xl text-white"></i>
          <h1 className="text-2xl font-bold text-white ml-4">Planibot</h1>
        </div>
        <div className="flex flex-col h-96 p-4 overflow-y-scroll">
          {chatHistory.map((message, index) => (
            <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-2`}>
              <div className={`max-w-xs rounded-lg p-3 ${message.sender === 'user' ? 'bg-gray-300 text-black'  :'user-message text-white' }`}>
                {message.text}
              </div>
            </div>
          ))}
        </div>
        <div className="text-and-voice p-4 border-t border-gray-300">
          <form onSubmit={handleTextSubmit} className="form-box">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Enter your message..."
              className="type-box flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none"
            />
            <button type="submit" className="bg-blue-500 text-white p-2 rounded-r-lg">
              Send
            </button>
          </form>
          <button
            onClick={handleRecordAudio}
            className="ml-2 p-2 mic-icon focus:outline-none"
          >
            <FontAwesomeIcon icon={faMicrophone} size="lg" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;