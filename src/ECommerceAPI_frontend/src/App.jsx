import React, { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { ECommerceAPI_backend } from 'declarations/ECommerceAPI_backend';
import './App.css';

const IDENTITY_URL = 'https://identity.ic0.app/#authorize';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [identity, setIdentity] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [products, setProducts] = useState([]);
  const [balance, setBalance] = useState(0);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productInventory, setProductInventory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [plugConnected, setPlugConnected] = useState(false);
<<<<<<< HEAD
=======
  const [productLink, setProductLink] = useState('');
  const [addBalanceAmount, setAddBalanceAmount] = useState('');
>>>>>>> 5899097 (Your commit message)

  useEffect(() => {
    const init = async () => {
      try {
        const authClient = await AuthClient.create();
        const isAuthenticated = await authClient.isAuthenticated();
        setIsAuthenticated(isAuthenticated);

        if (isAuthenticated) {
          const identity = await authClient.getIdentity();
          setIdentity(identity);
          await initializeUser(identity);
        }
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const initializeUser = async (identity) => {
    try {
      const principal = identity.getPrincipal().toText();
      const apiKey = await ECommerceAPI_backend.createUser(principal, "User");
      setApiKey(apiKey);
      await fetchProducts(apiKey);
      await fetchUserBalance(apiKey, principal);
    } catch (error) {
      console.error('User initialization error:', error);
    }
  };

  const handleLogin = async () => {
    try {
      const authClient = await AuthClient.create();
      await authClient.login({
        identityProvider: IDENTITY_URL,
        onSuccess: async () => {
          const identity = await authClient.getIdentity();
          setIdentity(identity);
          setIsAuthenticated(true);
          await initializeUser(identity);
        },
        onError: (error) => {
          console.error('Login error:', error);
        },
      });
    } catch (error) {
      console.error('Login process error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const authClient = await AuthClient.create();
      await authClient.logout();
      setIsAuthenticated(false);
      setIdentity(null);
      setApiKey('');
      setProducts([]);
      setBalance(0);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const fetchProducts = async (apiKey) => {
    try {
      const result = await ECommerceAPI_backend.listProducts(apiKey, 0, 10);
      if ('ok' in result) {
        setProducts(result.ok);
      } else {
        console.error(result.err);
      }
    } catch (error) {
      console.error('Fetch products error:', error);
    }
  };

  const fetchUserBalance = async (apiKey, principal) => {
    try {
      const result = await ECommerceAPI_backend.getUserBalance(apiKey, principal);
      if ('ok' in result) {
        setBalance(result.ok);
      } else {
        console.error(result.err);
      }
    } catch (error) {
      console.error('Fetch user balance error:', error);
    }
  };

  const handleAddProduct = async () => {
    try {
      const result = await ECommerceAPI_backend.addProduct(apiKey, productName, parseInt(productPrice), parseInt(productInventory));
      if ('ok' in result) {
        alert('Product added successfully');
<<<<<<< HEAD
=======
        setProductLink(result.ok);
>>>>>>> 5899097 (Your commit message)
        await fetchProducts(apiKey);
        setProductName('');
        setProductPrice('');
        setProductInventory('');
      } else {
        console.error(result.err);
        alert('Error adding product');
      }
    } catch (error) {
      console.error('Add product error:', error);
    }
  };

  const handleViewProduct = async (productId) => {
    try {
      const result = await ECommerceAPI_backend.getProduct(apiKey, productId);
      if ('ok' in result) {
        setSelectedProduct(result.ok);
<<<<<<< HEAD
=======
        const linkResult = await ECommerceAPI_backend.getProductLink(apiKey, productId);
        if ('ok' in linkResult) {
          setProductLink(linkResult.ok);
        }
>>>>>>> 5899097 (Your commit message)
      } else {
        console.error(result.err);
      }
    } catch (error) {
      console.error('View product error:', error);
    }
  };

  const handleAddToCart = async (productId, quantity) => {
    if (window.ic?.plug && plugConnected) {
      try {
        const result = await ECommerceAPI_backend.createOrder(apiKey, identity.getPrincipal().toText(), productId, quantity);
        if ('ok' in result) {
          setOrderId(result.ok);
          alert('Order created successfully');
<<<<<<< HEAD
          // Implement payment processing with Plug Wallet here
          // Example: await window.ic.plug.requestTransfer(...)
=======
          await fetchUserBalance(apiKey, identity.getPrincipal().toText());
          await fetchProducts(apiKey);
>>>>>>> 5899097 (Your commit message)
        } else {
          console.error(result.err);
          alert('Error creating order');
        }
      } catch (error) {
        console.error('Add to cart error:', error);
      }
    } else {
      alert('Please connect with Plug Wallet');
    }
  };

  const handleConnectPlugWallet = async () => {
    if (window.ic?.plug) {
      try {
        const connected = await window.ic.plug.requestConnect();
        if (connected) {
          setPlugConnected(true);
        }
      } catch (error) {
        console.error('Plug Wallet connection error:', error);
      }
    } else {
      alert('Plug Wallet extension is not available.');
    }
  };

<<<<<<< HEAD
=======
  const copyProductLink = () => {
    const fullLink = `${window.location.origin}/product/${productLink}`;
    navigator.clipboard.writeText(fullLink).then(() => {
      alert('Product link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  const handleAddBalance = async () => {
    try {
      const result = await ECommerceAPI_backend.addUserBalance(apiKey, identity.getPrincipal().toText(), parseInt(addBalanceAmount));
      if ('ok' in result) {
        alert('Balance added successfully');
        await fetchUserBalance(apiKey, identity.getPrincipal().toText());
        setAddBalanceAmount('');
      } else {
        console.error(result.err);
        alert('Error adding balance');
      }
    } catch (error) {
      console.error('Add balance error:', error);
    }
  };

>>>>>>> 5899097 (Your commit message)
  if (loading) {
    return <div className="App">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <h1>Welcome to E-Commerce API</h1>
        <button className="login-button" onClick={handleLogin}>Login with Internet Identity</button>
      </div>
    );
  }

  return (
    <div className="App">
      <button className="logout-button" onClick={handleLogout}>Logout</button>
      <h1>Dashboard</h1>
      <h2>Balance: {balance}</h2>

      {!plugConnected && (
        <button className="connect-plug-button" onClick={handleConnectPlugWallet}>Connect Plug Wallet</button>
      )}

<<<<<<< HEAD
=======
      {/* Add Balance Form */}
      <div className="add-balance-form">
        <h2>Add Balance</h2>
        <input
          type="number"
          value={addBalanceAmount}
          placeholder="Amount to add"
          onChange={(e) => setAddBalanceAmount(e.target.value)}
        />
        <button className="add-balance-button" onClick={handleAddBalance}>Add Balance</button>
      </div>

>>>>>>> 5899097 (Your commit message)
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
<<<<<<< HEAD
=======
        {productLink && (
          <div className="product-link">
            <p>Product Link: {`${window.location.origin}/product/${productLink}`}</p>
            <button onClick={copyProductLink}>Copy Link</button>
          </div>
        )}
>>>>>>> 5899097 (Your commit message)
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
<<<<<<< HEAD
=======
          {productLink && (
            <div className="product-link">
              <p>Product Link: {`${window.location.origin}/product/${productLink}`}</p>
              <button onClick={copyProductLink}>Copy Link</button>
            </div>
          )}
>>>>>>> 5899097 (Your commit message)
        </div>
      )}
    </div>
  );
}

export default App;