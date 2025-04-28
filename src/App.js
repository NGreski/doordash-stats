import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import OCRPage from './OCRPage';
import StatsDashboard from './StatsDashboard';
import 'bootstrap/dist/css/bootstrap.min.css'

function App() {
  return (
    <Router>
      <div className="p-4">
        <nav className="mb-4">
          <Link to="/" style={{ marginRight: '1rem' }}>Home (OCR)</Link>
          <Link to="/stats">Stats Dashboard</Link>
        </nav>
        <Routes>
          <Route path="/" element={<OCRPage />} />
          <Route path="/stats" element={<StatsDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
