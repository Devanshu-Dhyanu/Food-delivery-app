const CONTACT_EMAIL = 'info@vajracognixia.in';
const FOUNDER_EMAIL = 'founder-thevajra@vajracognixia.in';
const FOUNDER_INSTAGRAM_URL = 'https://www.instagram.com/devanshu_dhyanu/';
const COMPANY_INSTAGRAM_URL = 'https://www.instagram.com/vajracognixia.in/';

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-gray-900 px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-white">Contact Us</h1>
          <p className="text-gray-400">
            Reach out for support, business queries, founder contact, or social updates.
          </p>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h3 className="mb-2 text-lg font-semibold text-white">General Contact</h3>
            <p className="mb-4 text-gray-400">For general inquiries and support:</p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-orange-300 transition-colors hover:text-orange-400"
            >
              {CONTACT_EMAIL}
            </a>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h3 className="mb-2 text-lg font-semibold text-white">Founder Contact</h3>
            <p className="mb-4 text-gray-400">For founder and business communication:</p>
            <a
              href={`mailto:${FOUNDER_EMAIL}`}
              className="text-orange-300 transition-colors hover:text-orange-400"
            >
              {FOUNDER_EMAIL}
            </a>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h3 className="mb-2 text-lg font-semibold text-white">Phone Support</h3>
            <p className="mb-4 text-gray-400">Call us during business hours:</p>
            <a
              href="tel:+91-7250090813"
              className="text-orange-300 transition-colors hover:text-orange-400"
            >
              +91-7250090813
            </a>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h3 className="mb-2 text-lg font-semibold text-white">Founder Instagram</h3>
            <p className="mb-4 text-gray-400">Follow Devanshu Dhyanu:</p>
            <a
              href={FOUNDER_INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="text-orange-300 transition-colors hover:text-orange-400"
            >
              @devanshu_dhyanu
            </a>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h3 className="mb-2 text-lg font-semibold text-white">Company Instagram</h3>
            <p className="mb-4 text-gray-400">Follow VajraCognixia:</p>
            <a
              href={COMPANY_INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="text-orange-300 transition-colors hover:text-orange-400"
            >
              @vajracognixia.in
            </a>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h3 className="mb-2 text-lg font-semibold text-white">Address</h3>
            <p className="text-gray-400">
              The Vajra Campus Platform
              <br />
              Campus Location
              <br />
              Delhi, India
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 p-8">
          <h2 className="mb-4 text-2xl font-bold text-white">Send us a Message</h2>
          <form className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Name</label>
              <input
                type="text"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white focus:border-orange-300 focus:outline-none"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Email</label>
              <input
                type="email"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white focus:border-orange-300 focus:outline-none"
                placeholder="Your email"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Message</label>
              <textarea
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white focus:border-orange-300 focus:outline-none"
                placeholder="Your message"
                rows={5}
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-orange-300 py-2 font-semibold text-black transition-colors hover:bg-orange-400"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
