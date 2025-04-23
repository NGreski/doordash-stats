import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import './App.css';

function App() {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [debugTimes, setDebugTimes] = useState(null);

  const handleImageUpload = (e, setImage) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const extractTimeString = (str) => {
    const match = str.match(/(\d{1,2}:\d{2})\s?(AM|PM)?/i);
    return match ? match[1] : ''; // Return the time in HH:MM format
  };
  
  const extractMinutes = (timeString) => {
    // Using extractTimeString to get the time part (HH:MM)
    const time = extractTimeString(timeString);
    
    if (time) {
      // Get the part after the colon and convert it to an integer
      const minutes = time.split(':')[1]; // Get the minutes part as a string
      return parseInt(minutes, 10); // Convert to integer
    }
    return null; // Return null if the time string can't be parsed
  };
  
  const handleOCR = async () => {
    if (!image1 || !image2) return;
    setLoading(true);

    const [result1, result2] = await Promise.all([
      Tesseract.recognize(image1, 'eng'),
      Tesseract.recognize(image2, 'eng')
    ]);

    const rawText1 = result1.data.text;
    const rawText2 = result2.data.text;

    setText1(rawText1);
    setText2(rawText2);

    const lines1 = rawText1.split('\n').map(line => line.trim()).filter(Boolean);
    const lines2 = rawText2.split('\n').map(line => line.trim()).filter(Boolean);

    const parsed1 = parseFirstScreenshot(rawText1);
    const parsed2 = parseSecondScreenshot(rawText2);

    if (parsed1 && parsed2) {
      const actualTime = (parsed2.topTime - parsed1.topTime) / 60000;
      const expectedTime = (parsed1.deliverBy - parsed1.topTime) / 60000;

      const time1 = parsed1.deliverBy;
      const time2 = parsed2.topTime;
      const time3 = parsed1.topTime;

      const x = (time1 - time3) / 60000;
      const y = (time2 - time3) / 60000;

      setStats({
        money: parsed1.amount,
        actualTime: actualTime.toFixed(1),
        expectedTime: expectedTime.toFixed(1),
        miles: parsed1.miles
      });

      setDebugTimes({
        deliverBy: extractTimeString(lines1[9]),
        actualDelivered: extractTimeString(lines2[0]),
        original: extractTimeString(lines1[0]),
        x: x.toFixed(1),
        y: y.toFixed(1),
        deliverByMinutes: extractMinutes(lines1[9]),
        actualDeliveredMinutes: extractMinutes(lines2[0]),
        originalMinutes: extractMinutes(lines1[0])
      });
    }

    setLoading(false);
  };

  const parseTime = (str) => {
    const match = str.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i);
    if (!match) return null;
    let [_, h, m, period] = match;
    h = parseInt(h);
    m = parseInt(m);
    if (period.toUpperCase() === 'PM' && h !== 12) h += 12;
    if (period.toUpperCase() === 'AM' && h === 12) h = 0;
    const date = new Date();
    date.setHours(h, m, 0, 0);
    return date;
  };

  const parseFirstScreenshot = (text) => {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

    const topTime = parseTime(lines[0]);
    const deliverBy = lines.find(line => /deliver by/i.test(line));
    const deliverByTime = deliverBy ? parseTime(deliverBy) : null;

    const milesLine = lines[8] || '';
    const milesMatch = milesLine.match(/(\d+(\.\d+)?)\s*mi/i);
    const miles = milesMatch ? parseFloat(milesMatch[1]) : null;

    const amountMatch = text.match(/\$([\d\.]+)/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : null;

    const bottomTime = parseTime(lines[9]);

    return { topTime, deliverBy: deliverByTime, miles, amount, bottomTime };
  };

  const parseSecondScreenshot = (text) => {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    const topTime = parseTime(lines[0]);
    return { topTime };
  };

  return (
    <div className="container">
      <h1>Dasher OCR Tracker</h1>

      <p><strong>Step 1:</strong> Upload screenshot before accepting</p>
      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setImage1)} />

      <p><strong>Step 2:</strong> Upload screenshot after completing</p>
      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setImage2)} />

      <button onClick={handleOCR} disabled={loading}>
        {loading ? 'Processing...' : 'Get Stats'}
      </button>

      {stats && (
        <div className="output">
          <h2>Delivery Stats</h2>
          <p><strong>Money Earned:</strong> ${stats.money}</p>
          <p><strong>Actual Delivery Time:</strong> {stats.actualTime} minutes</p>
          <p><strong>Expected Delivery Time:</strong> {stats.expectedTime} minutes</p>
          <p><strong>Miles:</strong> {stats.miles} mi</p>
        </div>
      )}

      {debugTimes && (
        <div className="output">
          <h2>Debug Times</h2>
          <p><strong>Deliver By:</strong> {debugTimes.deliverBy}</p>
          <p><strong>Actual Delivered Time (Clean):</strong> {debugTimes.actualDelivered}</p>
          <p><strong>Original Time (Clean):</strong> {debugTimes.original}</p>
          <p><strong>X (DeliverBy - Original):</strong> {debugTimes.x} minutes</p>
          <p><strong>Y (ActualDelivered - Original):</strong> {debugTimes.y} minutes</p>
          <p><strong>Deliver By (Minutes):</strong> {debugTimes.deliverByMinutes}</p>
          <p><strong>Actual Delivered (Minutes):</strong> {debugTimes.actualDeliveredMinutes}</p>
          <p><strong>Original (Minutes):</strong> {debugTimes.originalMinutes}</p>
        </div>
      )}

      {(text1 || text2) && (
        <div className="output">
          <h2>Extracted Text (for debugging)</h2>
          <pre>{text1}</pre>
          <pre>{text2}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
