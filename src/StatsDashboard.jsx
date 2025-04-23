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

  //new stats
  const totalMoney = data.reduce((sum, d) => sum + d.money, 0);
  const totalMiles = data.reduce((sum, d) => sum + d.miles, 0);
  const totalActualTime = data.reduce((sum, d) => sum + d.actualTime, 0);
  const totalExpectedTime = data.reduce((sum, d) => sum + d.expectedTime, 0);

  const dollarsPerHour = totalActualTime > 0 ? ((totalMoney / totalActualTime) * 60).toFixed(2) : 0;
  const timeDiffs = data.map(d => d.expectedTime - d.actualTime);
  const avgTimeDiff = timeDiffs.length ? (timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length).toFixed(2) : 0;

  const costPerMile = 0.65; // or whatever you're estimating for gas/expenses
  const totalCost = totalMiles * costPerMile;
  const totalProfit = (totalMoney - totalCost).toFixed(2);

  //end new stats

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
        {/* <ul className="list-disc pl-5">
          <li>Average Money Earned: ${averageStats.avgMoney}</li>
          <li>Average Miles: {averageStats.avgMiles} mi</li>
          <li>Average Expected Time: {averageStats.avgExpected} mins</li>
          <li>Average Actual Time: {averageStats.avgActual} mins</li>
        </ul> */}
        <ul className="list-disc pl-5">
          <li>Dollars per Hour: ${dollarsPerHour}</li>
          <li>Total Miles: {totalMiles.toFixed(2)} mi</li>
          <li>Total Profit (after ${costPerMile}/mi): ${totalProfit}</li>
          <li>Avg Time Difference (Expected - Actual): {avgTimeDiff} mins</li>
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
