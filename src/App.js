import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setText('');
    }
  };

  const handleOCR = () => {
    if (!image) return;
    setLoading(true);
    Tesseract.recognize(
      image,
      'eng',
      { logger: (m) => console.log(m) }
    ).then(({ data: { text } }) => {
      setText(text);
      setLoading(false);
    });
  };

  return (
    <div className="container">
      <h1>Dasher OCR Tracker</h1>

      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <button onClick={handleOCR} disabled={loading}>
        {loading ? 'Processing...' : 'Run OCR'}
      </button>

      {image && <img src={image} alt="Uploaded" className="preview" />}
      {text && (
        <div className="output">
          <h2>Extracted Text:</h2>
          <pre>{text}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
