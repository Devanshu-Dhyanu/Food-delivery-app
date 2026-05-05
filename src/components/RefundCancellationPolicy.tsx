import { useEffect } from 'react';
import { applyDefaultSeo, applySeo } from '../lib/seo';

export default function RefundCancellationPolicy() {
  useEffect(() => {
    applySeo({
      title: 'Refund Policy | The Vajra',
      description:
        'Read The Vajra refund and cancellation policy for orders, delivery issues, late delivery, and payment refunds.',
      canonical: 'https://www.vajracognixia.in/refund-cancellation',
    });

    return () => {
      applyDefaultSeo();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold text-white mb-2">Refund & Cancellation Policy</h1>
        <p className="text-gray-400 mb-8">Last updated: April 2026</p>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Cancellation Policy</h2>
            
            <h3 className="text-xl font-semibold text-orange-300 mt-6 mb-3">Order Cancellation by Customer</h3>
            <p className="mb-3">
              You may cancel your order at any time before it is accepted by the restaurant. Once a restaurant accepts your order, cancellation may not be possible. The timeline for cancellation is as follows:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li><strong>Before Restaurant Confirmation:</strong> Free cancellation with full refund</li>
              <li><strong>After Restaurant Confirmation:</strong> Cancellation charges of 10% of order value or minimum ₹20 may apply</li>
              <li><strong>During Preparation:</strong> Cancellation charges of 25% of order value may apply</li>
              <li><strong>During Delivery:</strong> Cancellation is not possible</li>
            </ul>

            <h3 className="text-xl font-semibold text-orange-300 mt-6 mb-3">Cancellation by Restaurant</h3>
            <p>
              The Vajra or the restaurant serving you may cancel your order due to unavailability of items, stock issues, or operational reasons. In such cases, you will receive a full refund immediately along with a coupon for the inconvenience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Refund Policy</h2>
            
            <h3 className="text-xl font-semibold text-orange-300 mt-6 mb-3">Eligible Refunds</h3>
            <p className="mb-3">
              You are eligible for a refund in the following cases:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li>Order cancelled before restaurant confirmation</li>
              <li>Order cancelled as per the cancellation policy timelines</li>
              <li>Duplicate/accidental payment</li>
              <li>Order not delivered within the promised time (Full refund + ₹50 credit)</li>
              <li>Poor quality or incomplete order (Case-by-case assessment)</li>
            </ul>

            <h3 className="text-xl font-semibold text-orange-300 mt-6 mb-3">Refund Processing</h3>
            <p className="mb-3">
              Refunds will be processed as per the following timelines:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li><strong>Digital Wallets & UPI:</strong> 1-2 hours</li>
              <li><strong>Credit/Debit Cards:</strong> 3-5 working days</li>
              <li><strong>Net Banking:</strong> 2-3 working days</li>
              <li><strong>Wallet Credits:</strong> Instant</li>
            </ul>

            <p className="text-sm text-gray-400 mt-4">
              Refunds will be credited to the original payment method used during the transaction. In case of refund issues, please contact our support team.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Delivery Issues & Returns</h2>
            
            <h3 className="text-xl font-semibold text-orange-300 mt-6 mb-3">Late Delivery</h3>
            <p>
              If your order is delivered beyond the promised delivery time, you can raise a complaint within 24 hours of delivery. You'll receive a refund of delivery charges and additional compensation as determined by our team.
            </p>

            <h3 className="text-xl font-semibold text-orange-300 mt-6 mb-3">Damaged or Missing Items</h3>
            <p>
              If you receive damaged, expired, or missing items, please report it within 1 hour of delivery. We will either replace the item or provide a full refund along with applicable compensation.
            </p>

            <h3 className="text-xl font-semibold text-orange-300 mt-6 mb-3">Food Quality Complaints</h3>
            <p>
              If you're unsatisfied with the quality or taste of the food, please report it within 2 hours of delivery. Include photos/videos as evidence. Our team will investigate and provide appropriate compensation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Non-Refundable Items</h2>
            
            <p className="mb-3">
              The following are NOT eligible for refunds:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li>Promo codes and vouchers that have been redeemed</li>
              <li>Wallet credits and advance payments</li>
              <li>Cashback received through promotional offers</li>
              <li>Orders completed and delivered satisfactorily</li>
              <li>Complaints raised after 48 hours of delivery</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">How to Request a Refund</h2>
            
            <p className="mb-4">
              To request a refund:
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-4 mb-4">
              <li>Go to your Order History in your profile</li>
              <li>Select the order you want to raise a complaint for</li>
              <li>Tap on "Report Issue" or "Request Refund"</li>
              <li>Select the reason and provide details</li>
              <li>Submit photos/videos if applicable</li>
              <li>Our team will review and respond within 24 hours</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p>
              For any refund-related queries or disputes, please contact our support team at <strong>support@thevajra.com</strong> or call <strong>+91-8877665544</strong>. Our team is available 24/7 to assist you.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
