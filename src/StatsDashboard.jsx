import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StatsDashboard = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, 'deliveries'));
      const allData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setData(allData);
    };
    fetchData();
  }, []);

  const avg = (arr) => (arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : 0);

  const averageStats = {
    avgMoney: avg(data.map(d => d.money)),
    avgMiles: avg(data.map(d => d.miles)),
    avgExpected: avg(data.map(d => d.expectedTime)),
    avgActual: avg(data.map(d => d.actualTime)),
  };

  const enrichedData = data.map((d, i) => ({
    ...d,
    index: i + 1,
    efficiency: d.money / d.actualTime,
    speed: d.miles / d.actualTime
  }));

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Delivery Stats Dashboard</h1>

      {/* Section 1: Averages Summary */}
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-2xl font-semibold mb-4">Average Summary</h2>
        <ul className="list-disc pl-5">
          <li>Average Money Earned: ${averageStats.avgMoney}</li>
          <li>Average Miles: {averageStats.avgMiles} mi</li>
          <li>Average Expected Time: {averageStats.avgExpected} mins</li>
          <li>Average Actual Time: {averageStats.avgActual} mins</li>
        </ul>
      </div>

      {/* Section 2: Time Comparison Chart */}
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-2xl font-semibold mb-4">Expected vs Actual Delivery Times</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={enrichedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="index" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="expectedTime" stroke="#8884d8" name="Expected" />
            <Line type="monotone" dataKey="actualTime" stroke="#82ca9d" name="Actual" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Section 3: Efficiency Chart */}
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-2xl font-semibold mb-4">Delivery Efficiency (Money per Minute)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={enrichedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="index" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="efficiency" fill="#ff7300" name="$/Minute" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsDashboard;
