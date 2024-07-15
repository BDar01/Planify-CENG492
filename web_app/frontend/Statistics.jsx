import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StatItem = ({ label, value }) => (
  <div className="flex justify-between py-2">
    <h3 className="text-lg">{label}:</h3>
    <p className="text-lg">{value}</p>
  </div>
);

const Statistics = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await axios.get('http://localhost:5000/statistics');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };
    fetchStatistics();
  }, []);

  if (!stats) {
    return <div className="text-center">Loading Data...</div>;
  }

  return (
    <div className="max-w-md px-4 sm:px-7 md:max-w-3xl md:px-6 mt-8">
      <h1 className="text-5xl font-bold mb-8">Statistics</h1>
      <br />
      <h2 className="text-2xl font-semibold mb-2 text-center">Here is your activity data:</h2>
      <div className="bg-white shadow-md rounded-md border-4 border-red-500 p-4">
        <StatItem label="Total Completed Tasks" value={stats.totalCompletedTasks} />
        <StatItem label="Total Incompleted Tasks" value={stats.totalIncompletedTasks} />
        <StatItem label="Most Active Hour" value={stats.mostActiveHour} />
        <StatItem label="High Energy Tasks Completed" value={stats.highEnergyTasksCompleted} />
        <StatItem label="Low Energy Tasks Completed" value={stats.lowEnergyTasksCompleted} />
      </div>
    </div>
  );
};

export default Statistics;
