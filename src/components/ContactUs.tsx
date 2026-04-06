export default function ContactUs() {
  return (
    <div className="min-h-screen bg-gray-900 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Contact Us</h1>
          <p className="text-gray-400">We'd love to hear from you. Get in touch with us today.</p>
        </div>

        <div className="grid gap-6 mb-8 md:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Email Support</h3>
            <p className="text-gray-400 mb-4">For general inquiries and support:</p>
            <a href="mailto:support@thevajra.com" className="text-orange-300 hover:text-orange-400 transition-colors">
              support@vajracognixia.in
            </a>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Business Inquiries</h3>
            <p className="text-gray-400 mb-4">For partnerships and business:</p>
            <a href="mailto:business@thevajra.com" className="text-orange-300 hover:text-orange-400 transition-colors">
              founder@vajracognixia.in
            </a>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Phone Support</h3>
            <p className="text-gray-400 mb-4">Call us during business hours:</p>
            <a href="tel:+91-8877665544" className="text-orange-300 hover:text-orange-400 transition-colors">
              +91-7250090813
            </a>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Address</h3>
            <p className="text-gray-400">
              The Vajra Campus Platform<br />
              Campus Location<br />
              Delhi, India
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Send us a Message</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
              <input 
                type="text" 
                className="w-full rounded-lg bg-white/10 border border-white/20 text-white px-4 py-2 focus:outline-none focus:border-orange-300"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input 
                type="email" 
                className="w-full rounded-lg bg-white/10 border border-white/20 text-white px-4 py-2 focus:outline-none focus:border-orange-300"
                placeholder="Your email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
              <textarea 
                className="w-full rounded-lg bg-white/10 border border-white/20 text-white px-4 py-2 focus:outline-none focus:border-orange-300"
                placeholder="Your message"
                rows={5}
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-orange-300 text-black font-semibold py-2 rounded-lg hover:bg-orange-400 transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
