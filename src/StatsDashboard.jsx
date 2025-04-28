import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


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


  // new stats
  const totalMoney = data.reduce((sum, d) => sum + d.money, 0);
  const totalMiles = data.reduce((sum, d) => sum + d.miles, 0);
  const totalActualTime = data.reduce((sum, d) => sum + d.actualTime, 0);

  const dollarsPerHour = totalActualTime > 0 ? ((totalMoney / totalActualTime) * 60).toFixed(2) : 0;
  const timeDiffs = data.map(d => d.expectedTime - d.actualTime);
  const avgTimeDiff = timeDiffs.length ? (timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length).toFixed(2) : 0;

  const costPerMile = 0.30; // 1.00-.70
  const totalCost = totalMiles * costPerMile;
  const totalProfit = (totalMoney - totalCost).toFixed(2);
  const totalProfitNoCosts = totalMoney.toFixed(2);
  // end new stats

  const enrichedData = data.map((d, i) => ({
    ...d,
    index: i + 1,
    efficiency: d.money / d.actualTime,
    speed: d.miles / d.actualTime
  }));

  const rollingWindowSize = 6;
  const rollingData = enrichedData.map((_, i, arr) => {
    if (i < rollingWindowSize - 1) return null;
    const window = arr.slice(i - rollingWindowSize + 1, i + 1);
    const totalMoney = window.reduce((sum, d) => sum + d.money, 0);
    const totalMinutes = window.reduce((sum, d) => sum + d.actualTime, 0);
    const dollarsPerHour = totalMinutes > 0 ? (totalMoney / totalMinutes) * 60 : 0;
    return {
      index: i + 1,
      rollingDollarsPerHour: dollarsPerHour.toFixed(2),
    };
  }).filter(Boolean);

  const enrichedData1 = data.map((d, i) => ({
    ...d,
    index: i + 1,
    efficiency: d.money / d.actualTime,
    speed: d.miles / d.actualTime,
    moneyPerMile: d.miles > 0 ? d.money / d.miles : 0,
  }));

  return (
    <div className="container py-5">
      <h1 className="h2 fw-bold mb-4">Delivery Stats Dashboard</h1>

      {/* Section 1: Averages Summary */}
      <div className="card shadow mb-4">
        <div className="card-body">
          <h2 className="h4 fw-semibold mb-3">Average Summary</h2>
          <p className="text-muted mb-3 small">This section provides a summary of average statistics across all your deliveries. It includes key metrics such as your average money earned per hour, average miles driven, and expected vs actual delivery times.</p>
          <ul className="list-unstyled ps-3">
            <li>Dollars per Hour: ${dollarsPerHour}</li>
            <li>Total Miles: {totalMiles.toFixed(2)} mi</li>
            <li>Total Profit (no costs): ${totalProfitNoCosts}</li>
            <li>Total Profit (after ${costPerMile}/mi): ${totalProfit}</li>
            <li>Avg Time Difference (Expected - Actual): {avgTimeDiff} mins</li>
          </ul>
        </div>
      </div>

      {/* Section 2: Time Comparison Chart */}
      <div className="card shadow mb-4">
        <div className="card-body">
          <h2 className="h4 fw-semibold mb-3">Expected vs Actual Delivery Times</h2>
          <p className="text-muted mb-3 small">This chart compares the expected delivery time versus the actual time it took for each delivery. A positive difference indicates that the delivery took longer than expected, while a negative value shows that the delivery was quicker than expected.</p>
          <ResponsiveContainer width="100%" height={400}> {/* Increased height here */}
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
      </div>

      {/* Section 3: Rolling Average Dollars Per Hour */}
      <div className="card shadow mb-4">
        <div className="card-body">
          <h2 className="h4 fw-semibold mb-3">Rolling Average ($/Hour)</h2>
          <p className="text-muted mb-3 small">This chart shows the rolling average of your earnings per hour over the last 5 deliveries. It helps you track any changes in your earnings over time, giving you a better sense of your performance trend.</p>
          <ResponsiveContainer width="100%" height={400}> {/* Increased height here */}
            <LineChart data={rollingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="index" />
              <YAxis domain={['auto', 30]} /> {/* Set max limit of 50 */}
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="rollingDollarsPerHour" stroke="#ff7300" name="Rolling $/Hour" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Section 4: Money Per Mile by Delivery */}
      <div className="card shadow mb-4">
          <div className="card-body">
          <h2 className="h4 fw-semibold mb-3">Money Earned per Mile</h2>
          <p className="text-muted mb-3 small">This chart displays how much money you earned per mile for each delivery. Tracking this stat can help you understand how efficient your deliveries are in terms of distance traveled versus money earned.</p>
          <ResponsiveContainer width="100%" height={400}> {/* Increased height here */}
            <LineChart data={enrichedData1}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="index" />
              <YAxis domain={[0, 8]} />
              <Tooltip formatter={(value) => `$${value.toFixed(2)} per mile`} />
              <Legend />
              <Line type="monotone" dataKey="moneyPerMile" stroke="#82ca9d" name="$ per Mile" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
