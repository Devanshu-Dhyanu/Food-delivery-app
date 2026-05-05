import { useEffect } from 'react';
import { applyDefaultSeo, applySeo } from '../lib/seo';

export default function ShippingPolicy() {
  useEffect(() => {
    applySeo({
      title: 'Shipping Policy | The Vajra',
      description:
        'Read The Vajra shipping and delivery policy covering delivery timelines, service areas, tracking, and support.',
      canonical: 'https://www.vajracognixia.in/shipping-policy',
    });

    return () => {
      applyDefaultSeo();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold text-white mb-2">Shipping & Delivery Policy</h1>
        <p className="text-gray-400 mb-8">Last updated: April 2026</p>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Delivery Areas</h2>
            <p>
              The Vajra currently delivers within the campus and nearby areas. Delivery areas are limited to locations within 5 km radius from partner restaurants. You can check if your location is serviceable by entering your address during checkout.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Delivery Timelines</h2>
            
            <h3 className="text-xl font-semibold text-orange-300 mt-6 mb-3">Estimated Delivery Times</h3>
            <p className="mb-3">
              Delivery times vary based on restaurant and location, but typically:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li><strong>Peak Hours (12-2 PM, 7-9 PM):</strong> 30-45 minutes</li>
              <li><strong>Off-Peak Hours:</strong> 20-30 minutes</li>
              <li><strong>Special Items/Bulk Orders:</strong> 45-60 minutes</li>
            </ul>

            <p className="text-sm text-gray-400 mt-4">
              The Estimated Delivery Time (EDT) is provided at checkout and is indicative only. Actual delivery may take longer due to unforeseen circumstances.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Delivery Charges</h2>
            
            <h3 className="text-xl font-semibold text-orange-300 mt-6 mb-3">Standard Delivery</h3>
            <p className="mb-3">
              Delivery charges are calculated based on distance and are displayed at checkout:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li>Orders within 1 km: ₹20</li>
              <li>Orders within 2 km: ₹30</li>
              <li>Orders within 3 km: ₹40</li>
              <li>Orders within 5 km: ₹50</li>
            </ul>

            <h3 className="text-xl font-semibold text-orange-300 mt-6 mb-3">Free Delivery</h3>
            <p className="mb-3">
              Free delivery is available on:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li>Orders above ₹500</li>
              <li>Campus members with premium membership</li>
              <li>Promotional offers (when applicable)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Payment on Delivery</h2>
            
            <p className="mb-3">
              The Vajra currently offers the following payment options:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-3">
              <li>Prepayment via Digital Payment (UPI, Cards, Wallets)</li>
              <li>Prepayment via Net Banking</li>
            </ul>

            <p className="text-sm text-gray-400 mt-4">
              Cash on Delivery (CoD) is not currently available. All payments must be completed before delivery.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Tracking Your Order</h2>
            
            <p className="mb-3">
              You can track your order in real-time:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li>Open The Vajra app and go to "My Orders"</li>
              <li>Select the active order to see real-time status</li>
              <li>View delivery partner location and estimated arrival time</li>
              <li>Receive push notifications at each stage of delivery</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Delivery Delays</h2>
            
            <h3 className="text-xl font-semibold text-orange-300 mt-6 mb-3">Reasons for Delays</h3>
            <p className="mb-3">
              Delays can occur due to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li>Heavy traffic or weather conditions</li>
              <li>Restaurant preparation delays</li>
              <li>Address/location confusion</li>
              <li>System issues or unexpected circumstances</li>
            </ul>

            <h3 className="text-xl font-semibold text-orange-300 mt-6 mb-3">Compensation for Delays</h3>
            <p>
              If your order is delayed beyond the promised EDT:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-3">
              <li>Delays of 15-30 minutes: ₹20 wallet credit</li>
              <li>Delays of 30-60 minutes: ₹50 wallet credit + Full refund of delivery charges</li>
              <li>Delays beyond 60 minutes: Full refund + ₹100 wallet credit</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Delivery Instructions</h2>
            
            <p className="mb-3">
              To ensure smooth delivery:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li>Provide accurate and complete delivery address</li>
              <li>Include landmarks for easier location finding</li>
              <li>Provide accurate contact number</li>
              <li>Be available at the delivery time to receive your order</li>
              <li>Add special delivery instructions if needed (e.g., "Ring twice", "Leave at gate")</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Address-Related Issues</h2>
            
            <p className="mb-3">
              If there are issues with your address:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li>Contact the delivery partner immediately via the app</li>
              <li>Share your live location if needed</li>
              <li>If unable to locate, order will be returned and refunded</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Holidays & Off-Days</h2>
            
            <p>
              The Vajra operates 7 days a week, but availability depends on restaurant and delivery partner availability. During festivals and important holidays, some restaurants may be closed. You can check restaurant status on the app.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Lost or Undelivered Orders</h2>
            
            <p className="mb-3">
              In rare cases where an order is lost or cannot be delivered:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li>Report within 2 hours of estimated delivery time</li>
              <li>Provide supporting evidence (photos, messages)</li>
              <li>Full refund will be processed within 24 hours</li>
              <li>Additional compensation may be applicable</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Contact Support</h2>
            <p>
              For delivery-related concerns, please contact us at <strong>support@thevajra.com</strong> or call <strong>+91-8877665544</strong>. Our support team is available 24/7 to help.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
