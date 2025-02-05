import React, { useState } from "react";
import axios from "axios";

function App() {
  const [image, setImage] = useState(null);
  const [product, setProduct] = useState("");
  const [alternatives, setAlternatives] = useState([]);
  const [carbonTokens, setCarbonTokens] = useState(null);

  const handleImageUpload = (event) => {
    setImage(event.target.files[0]);
  };

  const uploadImage = async () => {
    if (!image) return alert("Please upload an image first!");
    
    const formData = new FormData();
    formData.append("image", image);

    try {
      const res = await axios.post("http://127.0.0.1:5000/upload", formData);
      setProduct(res.data.product_name);
    } catch (err) {
      alert("Error extracting text from image.");
    }
  };

  const findAlternatives = async () => {
    if (!product) return alert("No product detected!");
    
    try {
      const res = await axios.post("http://127.0.0.1:5000/search_alternatives", { product_name: product });
      setAlternatives(res.data.alternatives);
    } catch (err) {
      alert("Error fetching alternatives.");
    }
  };

  const calculateTokens = async () => {
    const originalPrice = 20;  // Example price
    const alternativePrice = 15;  // Example price

    try {
      const res = await axios.post("http://127.0.0.1:5000/calculate_tokens", {
        original_price: originalPrice,
        alternative_price: alternativePrice
      });
      setCarbonTokens(res.data.carbon_tokens);
    } catch (err) {
      alert("Error calculating tokens.");
    }
  };

  return (
    <div>
      <h1>Smart Banking: Eco-Friendly Shopping</h1>
      
      <input type="file" onChange={handleImageUpload} />
      <button onClick={uploadImage}>Extract Product Name</button>
      
      {product && (
        <>
          <h2>Detected Product: {product}</h2>
          <button onClick={findAlternatives}>Find Alternatives</button>
          <button onClick={calculateTokens}>Calculate Carbon Tokens</button>
        </>
      )}

      {alternatives.length > 0 && (
        <div>
          <h3>Sustainable Alternatives:</h3>
          <ul>
            {alternatives.map((link, index) => (
              <li key={index}><a href={link} target="_blank" rel="noopener noreferrer">{link}</a></li>
            ))}
          </ul>
        </div>
      )}

      {carbonTokens !== null && <h3>Carbon Tokens Earned: {carbonTokens}</h3>}
    </div>
  );
}

export default App;