import { useState, useEffect } from 'react';
import { getProducts, createCart } from '../services/shopifyService';
import PropTypes from 'prop-types';
import './ProductCatalog.css';

const ProductCatalog = ({ onCheckoutRedirect }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [processingCheckout, setProcessingCheckout] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const productData = await getProducts();
        setProducts(productData);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const addToCart = (product, variantId) => {
    const existingItem = cart.find(item => item.variantId === variantId);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.variantId === variantId 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const variant = product.variants.find(v => v.id === variantId);
      setCart([...cart, {
        variantId,
        productId: product.id,
        title: product.title,
        variantTitle: variant.title,
        price: variant.price,
        quantity: 1,
        image: product.images[0]?.url
      }]);
    }
  };

  const removeFromCart = (variantId) => {
    setCart(cart.filter(item => item.variantId !== variantId));
  };

  const updateQuantity = (variantId, quantity) => {
    if (quantity === 0) {
      removeFromCart(variantId);
    } else {
      setCart(cart.map(item => 
        item.variantId === variantId 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError('Please add items to cart before checkout');
      return;
    }

    try {
      setProcessingCheckout(true);
      setError(null);

      const lineItems = cart.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity
      }));

      const cartData = await createCart(lineItems);
      
      // Store cart data for webhook processing
      localStorage.setItem('aboveai_cart_id', cartData.id);
      localStorage.setItem('aboveai_cart_data', JSON.stringify(cart));
      
      // Redirect to Shopify checkout
      if (onCheckoutRedirect) {
        onCheckoutRedirect(cartData);
      } else {
        window.location.href = cartData.checkoutUrl;
      }
    } catch (err) {
      console.error('Error creating checkout:', err);
      setError('Failed to create checkout. Please try again.');
    } finally {
      setProcessingCheckout(false);
    }
  };

  if (loading) {
    return (
      <div className="product-catalog-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-catalog-container">
        <div className="error-container">
          {/* <div className="above-logo">ABOVE</div> */}
          <h2>Error</h2>
          <div className="error-message">{error}</div>
          <button 
            className="button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-catalog-container">
      {/* <div className="above-logo">ABOVE</div> */}
      <h1>Smart Necklace Collection</h1>
      <p className="subtitle">Revolutionary AI-powered wearables with subscription plans</p>

      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            {product.images.length > 0 && (
              <div className="product-image">
                <img 
                  src={product.images[0].url} 
                  alt={product.images[0].altText || product.title}
                />
              </div>
            )}
            
            <div className="product-info">
              <h3>{product.title}</h3>
              <p className="product-description">{product.description}</p>
              
              {product.tags.includes('subscription') && (
                <div className="subscription-badge">
                  Includes {product.metafields.subscription_type?.toUpperCase()} Subscription
                </div>
              )}
              
              <div className="product-variants">
                {product.variants.map(variant => (
                  <div key={variant.id} className="variant-option">
                    <div className="variant-info">
                      {variant.title !== 'Default Title' && (
                        <span className="variant-title">{variant.title}</span>
                      )}
                      <span className="variant-price">
                        ${variant.price} {variant.currencyCode}
                      </span>
                    </div>
                    
                    {variant.availableForSale ? (
                      <button
                        className="add-to-cart-btn"
                        onClick={() => addToCart(product, variant.id)}
                      >
                        Add to Cart
                      </button>
                    ) : (
                      <button className="add-to-cart-btn" disabled>
                        Out of Stock
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="cart-summary">
          <h3>Cart</h3>
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.variantId} className="cart-item">
                <div className="cart-item-info">
                  <span className="cart-item-title">
                    {item.title}{item.variantTitle !== 'Default Title' ? ` - ${item.variantTitle}` : ''}
                  </span>
                  <span className="cart-item-price">
                    ${item.price} × {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
                <div className="cart-item-controls">
                  <button
                    onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                  >
                    +
                  </button>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.variantId)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="cart-total">
            <strong>Total: ${getTotalPrice().toFixed(2)}</strong>
          </div>
          
          <button
            className="checkout-btn"
            onClick={handleCheckout}
            disabled={processingCheckout}
          >
            {processingCheckout ? 'Creating Checkout...' : 'Proceed to Checkout'}
          </button>
        </div>
      )}
    </div>
  );
};

ProductCatalog.propTypes = {
  onCheckoutRedirect: PropTypes.func
};

export default ProductCatalog;