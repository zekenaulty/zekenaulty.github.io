
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootswatch/dist/darkly/bootstrap.min.css';

import React, { useState, ChangeEvent } from 'react';

import ImageLoader from './ux/ImageLoader';


function App() {

  const [imageUrl, setImageUrl] = useState('');
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setImageUrl(event.target.value);
  };

  return (
    <>
      <div>
        <label htmlFor="imageUrl">Image URL: </label>
        <input
          type="text"
          id="imageUrl"
          value={imageUrl}
          onChange={handleInputChange}
        />
      </div>
      <ImageLoader imageUrl={imageUrl} />
    </>
  );
}

export default App;
