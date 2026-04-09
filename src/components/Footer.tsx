interface FooterProps {
  onNavigate?: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const handleLinkClick = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <footer className="border-t border-white/5 bg-black/20">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr] lg:items-start">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-orange-300">
              The Vajra Campus Delivery
            </p>
            <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
              Campus food delivery and student services, operated by The VajraCognixia Technologies Private Limited.
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-gray-400 sm:text-base">
              The Vajra brings campus ordering, delivery, and future student services into one
              platform with a clear brand name and company identity.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4">
              <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">Live now</p>
              <p className="text-lg font-semibold text-white">Food delivery</p>
              <p className="mt-2 text-sm text-gray-400">Browse restaurants, place orders, and track delivery.</p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4">
              <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">Coming soon</p>
              <p className="text-lg font-semibold text-white">Rentals and more</p>
              <p className="mt-2 text-sm text-gray-400">Cars, bikes, and campus marketplace flows can expand here next.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/5 pt-6">
          <div className="mb-6 grid gap-4 sm:grid-cols-2 md:grid-cols-5">
            <a
              href="/founder"
              className="text-sm text-gray-400 hover:text-orange-300 transition-colors text-left"
            >
              Founder & Vision
            </a>
            <button 
              onClick={() => handleLinkClick('contact-us')}
              className="text-sm text-gray-400 hover:text-orange-300 transition-colors text-left"
            >
              Contact Us
            </button>
            <button 
              onClick={() => handleLinkClick('terms-conditions')}
              className="text-sm text-gray-400 hover:text-orange-300 transition-colors text-left"
            >
              Terms & Conditions
            </button>
            <button 
              onClick={() => handleLinkClick('refund-cancellation')}
              className="text-sm text-gray-400 hover:text-orange-300 transition-colors text-left"
            >
              Refund & Cancellation
            </button>
            <button 
              onClick={() => handleLinkClick('shipping-policy')}
              className="text-sm text-gray-400 hover:text-orange-300 transition-colors text-left"
            >
              Shipping Policy
            </button>
          </div>
          
          <div className="flex flex-col gap-3 pt-5 border-t border-white/5 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; {new Date().getFullYear()} The VajraCognixia Technologies Private Limited. All rights reserved.</p>
            <p>The Vajra Campus Delivery brand and logo are used across the platform.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
