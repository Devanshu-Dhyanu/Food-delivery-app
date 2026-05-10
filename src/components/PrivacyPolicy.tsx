import { useEffect } from 'react';
import { applyDefaultSeo, applySeo } from '../lib/seo';
import LandingFooter from './LandingFooter';

export default function PrivacyPolicy() {
  useEffect(() => {
    applySeo({
      title: 'Privacy Policy | The Vajra',
      description:
        'Read the Privacy Policy for The Vajra and learn how platform, delivery, and account data is handled.',
      canonical: 'https://www.vajracognixia.in/privacy-policy',
    });

    return () => {
      applyDefaultSeo();
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-gray-900">
      <div className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-4xl font-bold text-white">Privacy Policy</h1>
        <p className="mb-8 text-gray-400">Last updated: April 2026</p>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="mb-4 text-2xl font-bold text-white">1. Information We Collect</h2>
            <p>
              We collect information you provide directly, such as your name, email address,
              phone number, delivery details, and profile information needed to use The Vajra
              platform.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-white">2. How We Use Your Information</h2>
            <p className="mb-3">
              We use your information to operate and improve the platform, including:
            </p>
            <ul className="ml-4 list-inside list-disc space-y-2">
              <li>Creating and managing your account</li>
              <li>Processing orders and payments</li>
              <li>Providing support and delivery updates</li>
              <li>Improving platform performance and security</li>
              <li>Sending important service-related communications</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-white">3. Payment and Transaction Data</h2>
            <p>
              Payment transactions may be processed through third-party payment partners. We do not
              store full card details on our platform. Transaction records are retained for support,
              accounting, and compliance purposes.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-white">4. Location and Delivery Data</h2>
            <p>
              Delivery and location details are used only to fulfill orders, coordinate deliveries,
              and improve order accuracy. We collect only the information required to complete the
              service you request.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-white">5. Data Sharing</h2>
            <p>
              We may share limited required information with restaurant partners, delivery partners,
              payment providers, and infrastructure providers only when needed to operate the
              service. We do not sell your personal information.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-white">6. Data Security</h2>
            <p>
              We take reasonable technical and operational measures to protect your information.
              However, no digital system can guarantee absolute security, so you should also keep
              your account credentials safe.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-white">7. Retention</h2>
            <p>
              We retain information only as long as necessary for platform operations, support,
              legal compliance, dispute resolution, and legitimate business purposes.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-white">8. Your Rights</h2>
            <p>
              You may contact us to request profile updates, corrections, or account-related help.
              Some data may be retained where required for legal, operational, or transaction
              records.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-white">9. Contact</h2>
            <p>
              For privacy-related questions, contact us at <strong>info@vajracognixia.in</strong>.
            </p>
          </section>
        </div>
        </div>
      </div>
      <LandingFooter />
    </div>
  );
}
