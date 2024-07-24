import React, { useState, useEffect } from 'react';
import { ECommerceAPI_backend } from 'declarations/ECommerceAPI_backend'; // Import backend bindings
import { AuthClient } from '@dfinity/auth-client'; // Import Internet Identity

import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [products, setProducts] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productInventory, setProductInventory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    async function checkAuth() {
      const authClient = await AuthClient.create();
      if (await authClient.isAuthenticated()) {
        const identity = authClient.getIdentity();
        setIsAuthenticated(true);
        setUser(identity);
        const apiKey = await ECommerceAPI_backend.createUser(identity.getPrincipal().toText(), "User");
        setApiKey(apiKey);
        fetchProducts(apiKey);
        fetchUserBalance(apiKey);
      }
      setLoading(false);
    }
    checkAuth();
  }, []);

  const fetchProducts = async (apiKey) => {
    try {
      const result = await ECommerceAPI_backend.listProducts(apiKey, 0, 10);
      if (result.ok) {
        setProducts(result.ok);
      } else {
        console.error(result.err);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUserBalance = async (apiKey) => {
    try {
      const result = await ECommerceAPI_backend.getUserBalance(apiKey, user.getPrincipal().toText());
      if (result.ok) {
        setBalance(result.ok);
      } else {
        console.error(result.err);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogin = async () => {
    const authClient = await AuthClient.create();
    await authClient.login({
      identityProvider: "https://identity.ic0.app/#authorize",
      onSuccess: () => {
        setIsAuthenticated(true);
        setUser(authClient.getIdentity());
      }
    });
  };

  const handleLogout = async () => {
    const authClient = await AuthClient.create();
    await authClient.logout();
    setIsAuthenticated(false);
    setUser(null);
    setApiKey("");
  };

  const handleAddProduct = async () => {
    try {
      const result = await ECommerceAPI_backend.addProduct(apiKey, productName, parseInt(productPrice), parseInt(productInventory));
      if (result.ok) {
        alert('Product added successfully');
        fetchProducts(apiKey);
        setProductName('');
        setProductPrice('');
        setProductInventory('');
      } else {
        console.error(result.err);
        alert('Error adding product');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleViewProduct = async (productId) => {
    try {
      const result = await ECommerceAPI_backend.getProduct(apiKey, productId);
      if (result.ok) {
        setSelectedProduct(result.ok);
      } else {
        console.error(result.err);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddToCart = async (productId, quantity) => {
    try {
      const result = await ECommerceAPI_backend.createOrder(apiKey, user.getPrincipal().toText(), productId, quantity);
      if (result.ok) {
        setOrderId(result.ok);
        alert('Order created successfully');
      } else {
        console.error(result.err);
        alert('Error creating order');
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div className="App">Loading...</div>;
  }

  return (
    <div className="App">
      {!isAuthenticated ? (
        <div className="login-container">
          <h1>E-Commerce API</h1>
          <button className="login-button" onClick={handleLogin}>Login with Internet Identity</button>
        </div>
      ) : (
        <div className="dashboard-container">
          <button className="logout-button" onClick={handleLogout}>Logout</button>
          <h1>Dashboard</h1>
          <h2>Balance: {balance}</h2>

          {/* Add Product Form */}
          <div className="add-product-form">
            <h2>Add Product</h2>
            <input
              type="text"
              value={productName}
              placeholder="Product Name"
              onChange={(e) => setProductName(e.target.value)}
            />
            <input
              type="number"
              value={productPrice}
              placeholder="Product Price"
              onChange={(e) => setProductPrice(e.target.value)}
            />
            <input
              type="number"
              value={productInventory}
              placeholder="Product Inventory"
              onChange={(e) => setProductInventory(e.target.value)}
            />
            <button className="add-product-button" onClick={handleAddProduct}>Add Product</button>
          </div>

          {/* Product List */}
          <h2>Products</h2>
          <ul className="product-list">
            {products.map((product) => (
              <li key={product.id} className="product-item">
                <div className="product-info">
                  <div className="product-name">{product.name}</div>
                  <div className="product-price">Price: {product.price}</div>
                  <div className="product-inventory">Inventory: {product.inventory}</div>
                  <button className="view-product-button" onClick={() => handleViewProduct(product.id)}>View Details</button>
                  <button className="add-to-cart-button" onClick={() => handleAddToCart(product.id, 1)}>Add to Cart</button>
                </div>
              </li>
            ))}
          </ul>

          {/* Product Details */}
          {selectedProduct && (
            <div className="product-details">
              <h2>Product Details</h2>
              <p><strong>Name:</strong> {selectedProduct.name}</p>
              <p><strong>Price:</strong> {selectedProduct.price}</p>
              <p><strong>Inventory:</strong> {selectedProduct.inventory}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
