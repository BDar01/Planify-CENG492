import React from 'react';

const ResponseWindow = ({ responseMessage, onClose }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-900 bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg relative">
        {/* X button in the top right corner */}
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {/* Content */}
        <p className="text-xl font-semibold">Scheduled according to input:</p>
        <br />
        <p className="flex justify-center text-xl">{responseMessage}</p>
      </div>
    </div>
  );
};

export default ResponseWindow;
