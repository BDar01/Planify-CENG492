import React, { useState, useEffect } from "react";
import "./StressnRecommendations.css";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";

const StressnRecommendations = () => {
  const [isStressed, setIsStressed] = useState(null);
  const [showStressLevelButtons, setShowStressLevelButtons] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [incompletedCount, setIncompletedCount] = useState(0);

  const handleStressResponse = (response) => {
    setIsStressed(response);
    setShowStressLevelButtons(response);
  };

  const handleStressLevelSelect = (level) => {
    setIsStressed(level);
    setShowStressLevelButtons(false);
  };

  const navigatePrevious = () => {
    // Handle navigation to the previous question or action
  };

  const navigateNext = () => {
    // Handle navigation to the next question or action
  };

  const recommendations = {
    3: [
      { text: "Feeling overwhelmed? Take a break and go for a short walk." },
      { text: "Breathe deeply and try some relaxation exercises." },
      { text: "Listen to calming music to help reduce stress." },
      {
        text: "Here's a playlist of relaxing music you can try.",
        link: "https://www.youtube.com/watch?v=lFcSrYw-ARY",
      },
      { text: "Try a guided meditation to help clear your mind." },
      { text: "Try a simple puzzle or game to shift your focus." },
      {
        text: "Write down what's stressing you out; sometimes seeing it on paper helps.",
      },
      {
        text: "Drink a glass of water; staying hydrated can help improve your mood.",
      },
      { text: "Do some light stretching or yoga to release physical tension." },
      { text: "Splash your face with cold water for a quick refresh." },
      { text: "Call or message a friend to talk about what's on your mind." },
      {
        text: "Join a supportive online community where you can share and listen.",
      },
      { text: "Consider talking to a therapist if stress feels unmanageable." },
    ],
    2: [
      { text: "Could you use a break? Take short breaks between tasks." },
      { text: "Practice mindfulness exercises to stay grounded." },
      { text: "Stretch your body to release tension." },
      { text: "Listen to your favorite music to unwind." },
      { text: "Take a few moments to visualize a peaceful place." },
      { text: "Jot down three things you're grateful for right now." },
      { text: "Do a quick brain dump of all your tasks and prioritize them." },
      {
        text: "Stand up and do a few jumping jacks to get your blood flowing.",
      },
      { text: "Walk around your home or office for a change of scenery." },
      {
        text: "Try progressive muscle relaxation: tense and then relax each muscle group.",
      },
      { text: "Have a quick chat with a colleague or family member." },
      { text: "Watch a funny video to lighten your mood." },
      {
        text: "Plan a social activity for the evening or weekend to look forward to.",
      },
    ],
    1: [
      { text: "Feeling on top of things? Keep up the good work!" },
      { text: "Reward yourself for completing tasks." },
      { text: "Take some time to do something enjoyable." },
      { text: "Relax with your favorite music." },
      { text: "Take a moment to appreciate what you've accomplished today." },
      {
        text: "Plan a small reward for yourself for staying on top of things.",
      },
      { text: "Write a quick journal entry about your day so far." },
      { text: "Go for a leisurely walk to enjoy the fresh air." },
      { text: "Take a few minutes to do a quick, invigorating workout." },
      { text: "Enjoy a healthy snack to keep your energy up." },
      { text: "Send a positive message to someone you care about." },
      { text: "Plan a fun activity with friends or family." },
      { text: "Share your success with someone who supports you." },
    ],
  };

  const generateRecommendation = () => {
    if (isStressed && recommendations[isStressed]) {
      const recommendationsForLevel = recommendations[isStressed];
      const randomIndex = Math.floor(
        Math.random() * recommendationsForLevel.length
      );
      return recommendationsForLevel[randomIndex];
    }
    return null;
  };

  useEffect(() => {
    fetch("http://localhost:5000/getallevents", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Include JWT token for authentication
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const incompletedCount = data.events.filter(
          (event) => event.completed === false
        ).length;
        const completedCount = data.events.filter(
          (event) => event.completed === true
        ).length;
        setCompletedCount(completedCount);
        setIncompletedCount(incompletedCount);
      });
  }, []);
  const recommendation = generateRecommendation();

  return (
    <div className="stress-recommendations-container">
      <div className="flex flex-col h-full bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="chatbot-head flex items-center justify-center p-4">
          <i className="bi bi-emoji-smile text-4xl text-white"></i>
          <h1 className="text-2xl font-bold text-white ml-4">
            Stress Monitoring & Recommendations
          </h1>
        </div>
        <div className="recommendations-content">
          {incompletedCount > completedCount && (
            <h2 className="bg-white-500 text-black p-10 rounded-r-lg text-2xl">
              Planify detects some of your tasks are incomplete.
            </h2>
          )}
          {isStressed === null && incompletedCount > completedCount ? (
            <>
              <p className="question">Are you feeling stressed?</p>
              <div className="buttons">
                <button
                  onClick={() => handleStressResponse(true)}
                  className="submit-button"
                >
                  Yes
                </button>
                <button
                  onClick={() => handleStressResponse(false)}
                  className="submit-button"
                >
                  No
                </button>
              </div>
            </>
          ) : (
            <>
              {showStressLevelButtons ? (
                <>
                  <p className="question">Please enter your stress level</p>
                  <div className="buttons">
                    <button
                      onClick={() => handleStressLevelSelect(1)}
                      className="submit-button"
                    >
                      1
                    </button>
                    <button
                      onClick={() => handleStressLevelSelect(2)}
                      className="submit-button"
                    >
                      2
                    </button>
                    <button
                      onClick={() => handleStressLevelSelect(3)}
                      className="submit-button"
                    >
                      3
                    </button>
                  </div>
                  <div className="navigation-buttons">
                    <button
                      onClick={navigatePrevious}
                      className="navigation-button"
                    >
                      <ChevronLeftIcon className="icon" />
                    </button>
                    <button
                      onClick={navigateNext}
                      className="navigation-button"
                    >
                      <ChevronRightIcon className="icon" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {isStressed ? (
                    <div className="recommendations">
                      {recommendation.link ? (
                        <p className="music-recommendation">
                          Here's a{" "}
                          <a
                            href={recommendation.link}
                            className="music-link"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            playlist of relaxing music
                          </a>{" "}
                          you can try.
                        </p>
                      ) : (
                        <p className="recommendation">{recommendation.text}</p>
                      )}
                    </div>
                  ) : incompletedCount <= completedCount ? (
                    <p className="response text-black text-2xl p-10">
                      Your are doing well, keep going!
                    </p>
                  ) : (
                    <p className="response text-black">Good, best of luck!</p>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StressnRecommendations;
