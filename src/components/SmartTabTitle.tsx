import { useEffect } from 'react';
import { useCart } from '../context/CartContext';

type SmartTabTitleProps = {
  currentPage:
    | 'home'
    | 'menu'
    | 'cart'
    | 'checkout'
    | 'orders'
    | 'order-placed'
    | 'announcements'
    | 'profile'
    | 'founder'
    | 'contact-us'
    | 'terms-conditions'
    | 'refund-cancellation'
    | 'shipping-policy'
    | 'payment-callback';
  loading: boolean;
  isAuthenticated: boolean;
  hasProfile: boolean | null;
};

const HOME_TITLE = 'The Vajra Campus Delivery | The VajraCognixia Technologies Private Limited';

const getCartTitle = (totalItems: number, suffix: string) => {
  const itemLabel = totalItems === 1 ? 'item' : 'items';
  return `${totalItems} ${itemLabel} ${suffix} | The Vajra`;
};

const getHomeTitle = () => HOME_TITLE;

export default function SmartTabTitle({
  currentPage,
  loading,
  isAuthenticated,
  hasProfile,
}: SmartTabTitleProps) {
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  useEffect(() => {
    if (loading) {
      document.title = 'Loading The Vajra...';
      return;
    }

    if (!isAuthenticated) {
      document.title = getHomeTitle();
      return;
    }

    if (hasProfile === null) {
      document.title = 'Checking your profile | The Vajra';
      return;
    }

    if (hasProfile === false) {
      document.title = 'Complete your profile | The Vajra';
      return;
    }

    if (totalItems > 0 && (currentPage === 'cart' || currentPage === 'checkout')) {
      document.title =
        currentPage === 'checkout'
          ? getCartTitle(totalItems, 'ready for checkout')
          : getCartTitle(totalItems, 'waiting in cart');
      return;
    }

    switch (currentPage) {
      case 'home':
        document.title = getHomeTitle();
        break;
      case 'menu':
        document.title =
          totalItems > 0
            ? getCartTitle(totalItems, 'picked so far')
            : 'Browse the menu | The Vajra';
        break;
      case 'cart':
        document.title = totalItems > 0 ? getCartTitle(totalItems, 'waiting in cart') : 'Your cart | The Vajra';
        break;
      case 'checkout':
        document.title =
          totalItems > 0 ? getCartTitle(totalItems, 'ready for checkout') : 'Checkout | The Vajra';
        break;
      case 'orders':
        document.title = 'Track your order | The Vajra';
        break;
      case 'order-placed':
        document.title = 'Order placed successfully | The Vajra';
        break;
      case 'announcements':
        document.title = 'Campus offers | The Vajra';
        break;
      case 'profile':
        document.title = 'Your profile | The Vajra';
        break;
      case 'founder':
        document.title = 'Devanshu Dhyanu | Founder of The Vajra Campus Delivery';
        break;
      case 'payment-callback':
        document.title = 'Processing payment | The Vajra';
        break;
      default:
        document.title = HOME_TITLE;
    }
  }, [currentPage, hasProfile, isAuthenticated, loading, totalItems]);

  return null;
}
