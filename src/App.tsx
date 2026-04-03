import { useState } from 'react';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import RestaurantList from './components/RestaurantList';
import RestaurantMenu from './components/RestaurantMenu';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import OrderTracking from './components/OrderTracking';

type Page = 'home' | 'menu' | 'cart' | 'checkout' | 'orders' | 'order-placed';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
  const [placedOrderId, setPlacedOrderId] = useState<string>('');

  const handleSelectRestaurant = (restaurantId: string) => {
    setSelectedRestaurantId(restaurantId);
    setCurrentPage('menu');
  };

  const handleCheckout = () => {
    setCurrentPage('checkout');
  };

  const handleOrderPlaced = (orderId: string) => {
    setPlacedOrderId(orderId);
    setCurrentPage('order-placed');
    setTimeout(() => {
      setCurrentPage('orders');
    }, 3000);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <RestaurantList onSelectRestaurant={handleSelectRestaurant} />;
      case 'menu':
        return (
          <RestaurantMenu
            restaurantId={selectedRestaurantId}
            onBack={() => setCurrentPage('home')}
          />
        );
      case 'cart':
        return <Cart onCheckout={handleCheckout} />;
      case 'checkout':
        return (
          <Checkout
            onBack={() => setCurrentPage('cart')}
            onOrderPlaced={handleOrderPlaced}
          />
        );
      case 'orders':
        return <OrderTracking />;
      case 'order-placed':
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Order Placed Successfully!</h2>
              <p className="text-gray-400 mb-4">Order ID: {placedOrderId.slice(0, 8)}</p>
              <p className="text-gray-400">Redirecting to order tracking...</p>
            </div>
          </div>
        );
      default:
        return <RestaurantList onSelectRestaurant={handleSelectRestaurant} />;
    }
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-900">
        <Header currentPage={currentPage} onNavigate={setCurrentPage} />
        {renderPage()}
      </div>
    </CartProvider>
  );
}

export default App;
