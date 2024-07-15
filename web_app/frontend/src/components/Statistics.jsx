import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Statistics.css";
import ReactApexChart from "react-apexcharts";

const StatCard = ({ title, stats }) => (
  <div className="stat-card bg-white shadow-md rounded-md p-6 m-2">
    <h2
      className={`text-2xl font-semibold mb-4 ${
        title === "General Statistics" ? "text-left" : ""
      }`}
    >
      {title}
    </h2>
    {stats.map(({ label, value }) => (
      <div
        key={label}
        className={`flex justify-between py-2 ${
          title === "General Statistics" ? "text-right" : ""
        }`}
      >
        <h3 className="text-lg font-bold">
          {label
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())}
        </h3>
        {Array.isArray(value) &&
        value.length > 0 &&
        typeof value[0] === "object" ? (
          <div>
            {value.map((item, index) => (
              <p key={index} className="text-lg text-gray-600">
                {item.priority || item.type}: {item.count}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-lg">{value}</p>
        )}
      </div>
    ))}
  </div>
);

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [chartType, setChartType] = useState("bar");
  const [selectedDay, setSelectedDay] = useState("Mon"); // Default selected day

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await axios.get('http://localhost:5000/statistics', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Include JWT token for authentication
          },
        });
        setStats(response.data);
        console.log('Statistics:', response.data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };
    fetchStatistics();
  }, []);

  if (!stats) {
    return <div className="text-center">Loading Data...</div>;
  }

  const adjustedStats = {
    ...stats,
    heaviestDay: stats.heaviestDay === null ? "N/A" : stats.heaviestDay,
    priorityBreakdown:
      typeof stats.priorityBreakdown === "object"
        ? Object.entries(stats.priorityBreakdown).map(([key, value]) => {
            let priorityLabel;
            switch (key) {
              case "1":
                priorityLabel = "Low";
                break;
              case "2":
                priorityLabel = "Medium";
                break;
              case "3":
                priorityLabel = "High";
                break;
              default:
                priorityLabel = "Unknown";
            }
            return { priority: priorityLabel, count: value };
          })
        : [],
    taskTypeBreakdown:
      typeof stats.taskTypeBreakdown === "object"
        ? Object.entries(stats.taskTypeBreakdown).map(([key, value]) => ({
            type: key || "None",
            count: value,
          }))
        : [],
    topRescheduledEvents:
      typeof stats.topRescheduledEvents === "object"
        ? Object.entries(stats.topRescheduledEvents).map(([key, value]) => ({
            type: key || "None",
            count: value,
          }))
        : [],
  };

  const groupedStats1 = [
    {
      title: "Task Completion",
      stats: [
        { label: "Total Tasks", value: adjustedStats.totalTasks },
        {
          label: "Total Completed Tasks",
          value: adjustedStats.totalCompletedTasks,
        },
        {
          label: "Total Incompleted Tasks",
          value: adjustedStats.totalIncompletedTasks,
        },
        { label: "Heaviest Day", value: adjustedStats.heaviestDay },
      ],
    },
  ];

  const groupedStats3 = [
    {
      title: "Task Type Breakdown",
      stats: [
        {
          label: "Task Type Breakdown",
          value: adjustedStats.taskTypeBreakdown,
        },
      ],
    },
    {
      title: "Priority Breakdown",
      stats: [
        { label: "Priority Breakdown", value: adjustedStats.priorityBreakdown },
      ],
    },
  ];
  const groupedStats2 = [
    {
      title: "General Statistics",
      stats: [
        {
          label: "Average Completion Rate",
          value: adjustedStats.completionRate,
        },
        { label: "Longest Task", value: adjustedStats.longestTask },
        { label: "Shortest Task", value: adjustedStats.shortestTask },
        {
          label: "Top Rescheduled Events",
          value: adjustedStats.topRescheduledEvents,
        },
        {
          label: "Average Event Rescheduling",
          value: adjustedStats.averageRescheduleFrequency,
        },
      ],
    },
  ];

  const donutSeries = [
    adjustedStats.totalCompletedTasks,
    adjustedStats.totalIncompletedTasks,
  ];
  const donutOptions = {
    chart: {
      type: "donut",
      foreColor: "#333",
    },
    colors: ["#57c827", "#ef4444"],
    labels: ["Complete Tasks", "Incomplete Tasks"],
  };

  const barSeries1 = [
    {
      name: "Completed",
      data: [adjustedStats.totalCompletedTasks],
    },
    {
      name: "Incomplete",
      data: [adjustedStats.totalIncompletedTasks],
    },
  ];

  const dailyProductivity = stats.dailyProductivity;

  const handleDayChange = (day) => {
    setSelectedDay(day);
  };

  const barSeries2 = [
    {
      name: "Productivity Score",
      data: dailyProductivity[selectedDay],
    },
  ];

  const barOptions2 = {
    chart: {
      type: "bar",
      height: 430,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "90%", // Adjust column width to make bars wider
        endingShape: "rounded",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: Array.from(
        { length: dailyProductivity[selectedDay].length },
        (_, i) => `${i}:00`
      ),
      tickPlacement: "off", // Spread out the times more evenly
    },
    yaxis: {
      title: {
        text: "Productivity Score",
      },
      forceNiceScale: true,
    },
    fill: {
      opacity: 1,
    },
    colors: ["#ff4700"],
  };

  const barOptions1 = {
    chart: {
      type: "bar",
      height: 430,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        endingShape: "rounded",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: ["Tasks"],
    },
    yaxis: {
      title: {
        text: "",
      },
      forceNiceScale: true,
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " tasks";
        },
      },
    },
    colors: ["#57c827", "#ef4444"],
  };

  const handleChartChange = (type) => {
    setChartType(type);
  };

  const sortedDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Now you can use `sortedDays` to render buttons or any other elements in the desired order

  return (
    <div className="stats-cont max-w-screen-xl mx-auto p-6">
      <div className="flex items-center justify-center lg:justify-start mb-8">
        <i className="bi bi-bar-chart-line text-5xl text-black block lg:inline-block mr-4"></i>
        <div className="lg:text-left">
          <h1 className="text-5xl font-bold mb-2">Statistics</h1>
          <h2 className="text-2xl font-semibold mb-2">Your activity data:</h2>
        </div>
      </div>
      <div
        style={{ margin: "3%" }}
        className="grid grid-cols-1 lg:grid-cols-5 gap-2"
      >
        <div className="col-span-3" style={{ width: "max-content" }}>
          <div className="bg-white shadow-md rounded-md p-6">
            <div className="chart-container">
              <ReactApexChart
                options={barOptions2}
                series={barSeries2}
                type="bar"
                height={300}
                width={530}
              />
            </div>
            <div className="flex justify-center mt-4">
              {sortedDays.map((day) => (
                <button
                  key={day}
                  className={`mr-4 ${
                    selectedDay === day
                      ? "bg-[#ff4700] text-white"
                      : "bg-gray-200 text-gray-700"
                  } py-2 px-4 rounded`}
                  onClick={() => handleDayChange(day)}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="col-span-2">
          <div style={{ height: "90%" }} className="stat-cards-container ">
            {groupedStats1.map((group, index) => (
              <StatCard key={index} title={group.title} stats={group.stats} />
            ))}
          </div>
        </div>
      </div>
      <div
        style={{ width: "max-width" }}
        className="grid grid-cols-1 lg:grid-cols-6 gap-6"
      >
        <div style={{ width: "max-width" }} className="col-span-2">
          <div
            style={{ width: "max-width" }}
            className="stat-cards-container grid grid-cols-1 md:grid-rows-2 gap-4"
          >
            {groupedStats3.map((group, index) => (
              <StatCard key={index} title={group.title} stats={group.stats} />
            ))}
          </div>
        </div>

        <div style={{ width: "max-width" }} className="col-span-2">
          <div className="stat-cards-container grid grid-cols-1 md:grid-cols-1 gap-4">
            {groupedStats2.map((group, index) => (
              <StatCard key={index} title={group.title} stats={group.stats} />
            ))}
          </div>
        </div>

        <div className="col-span-2">
          <div className="bg-white shadow-md rounded-md p-6">
            <div className="chart-container">
              {chartType === "donut" && (
                <ReactApexChart
                  options={donutOptions}
                  series={donutSeries}
                  type="donut"
                  width={380}
                  height={380}
                />
              )}
              {chartType === "bar" && (
                <ReactApexChart
                  options={barOptions1}
                  series={barSeries1}
                  type="bar"
                  height={430}
                />
              )}
            </div>
            <div className="flex justify-center mt-4">
              <button
                className={`mr-4 ${
                  chartType === "bar"
                    ? "bg-[#ff4700] text-white"
                    : "bg-gray-200 text-gray-700"
                } py-2 px-4 rounded`}
                onClick={() => handleChartChange("bar")}
              >
                Bar
              </button>
              <button
                className={`${
                  chartType === "donut"
                    ? "bg-[#ff4700] text-white"
                    : "bg-gray-200 text-gray-700"
                } py-2 px-4 rounded`}
                onClick={() => handleChartChange("donut")}
              >
                Donut
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
