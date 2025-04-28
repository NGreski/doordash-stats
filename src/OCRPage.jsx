import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import './App.css';
import { db } from './firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css'


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
    return match ? match[1] : ''; 
  };
  
  const extractMinutes = (timeString) => {
    const time = extractTimeString(timeString);
    
    if (time) {
  
      const minutes = time.split(':')[1];
      return parseInt(minutes, 10); 
    }
    return null; 
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

    //not needed leaving for debugging for now
    const lines1 = rawText1.split('\n').map(line => line.trim()).filter(Boolean);
    const lines2 = rawText2.split('\n').map(line => line.trim()).filter(Boolean);

    const parsed1 = parseFirstScreenshot(rawText1);
    const parsed2 = parseSecondScreenshot(rawText2);

    if (parsed1 && parsed2) {

      let { time1, time3 } = parsed1;
      let { time2 } = parsed2;

      let x = (time1 - time3);
      let y = (time2 - time3);

      if (x < 0){
        x = ((time1 + 60) - time3)
      }

      if(y < 0){
        y = ((time2 + 60) - time3)
      }

      setStats({
        money: parsed1.amount,
        expectedTime: x,
        actualTime: y,
        miles: parsed1.miles
      });

      //firebase
      await addDoc(collection(db, 'deliveries'), {
        money: parsed1.amount,
        expectedTime: x,
        actualTime: y,
        miles: parsed1.miles,
        timestamp: Timestamp.now()
      });

      //printing to page for debugging
      setDebugTimes({
        deliverBy: extractTimeString(lines1[9]),
        actualDelivered: extractTimeString(lines2[0]),
        original: extractTimeString(lines1[0]),
        x: x,
        y: y,
        deliverByMinutes: extractMinutes(lines1[9]),
        actualDeliveredMinutes: extractMinutes(lines2[0]),
        originalMinutes: extractMinutes(lines1[0])
      });
    }

    setLoading(false);
  };

  const parseFirstScreenshot = (text) => {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

    //miles
    const milesLine = lines.find(line => /mi\b/i.test(line)) || '';
    const milesMatch = milesLine.match(/(\d+(\.\d+)?)\s*mi\b/i);
    const miles = milesMatch ? parseFloat(milesMatch[1]) : null;
    
    //amount
    const amountMatch = text.match(/\$([\d\.]+)/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : null;

    //times
    const timeStrings = lines.filter(line => /(\d{1,2}:\d{2})\s?(AM|PM)?/i.test(line));
    const time1 = timeStrings.length > 1 ? extractMinutes(timeStrings[1]) : null;
    const time3 = timeStrings.length > 0 ? extractMinutes(timeStrings[0]) : null;

    return {miles, amount, time1, time3};
  };

  const parseSecondScreenshot = (text) => {
    
    //time
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    const timeStrings = lines.filter(line => /(\d{1,2}:\d{2})\s?(AM|PM)?/i.test(line));
    const time2 = timeStrings.length > 0 ? extractMinutes(timeStrings[0]) : null;

    return { time2 };
  };

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">Dasher OCR Tracker</h1>

      <p><strong>Step 1:</strong> Upload screenshot before accepting</p>
      <input className="form-control mb-3" type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setImage1)} />

      <p><strong>Step 2:</strong> Upload screenshot after completing</p>
      <input className="form-control mb-4" type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setImage2)} />

      <button className="btn btn-danger w-100 mb-4" onClick={handleOCR} disabled={loading}>
      {loading ? 'Processing...' : 'Get Stats'}
      </button>

      {stats && (
        <div className="card p-4 mb-4 shadow-sm">
          <h2>Delivery Stats</h2>
          <p><strong>Money Earned:</strong> ${stats.money}</p>
          <p><strong>Expected Delivery Time:</strong> {stats.expectedTime} minutes</p>
          <p><strong>Actual Delivery Time:</strong> {stats.actualTime} minutes</p>
          <p><strong>Miles:</strong> {stats.miles} mi</p>
        </div>
      )}

      {/* Printing for DEBUGGING ONLY */}
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
