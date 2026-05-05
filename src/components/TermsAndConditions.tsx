import { useEffect } from 'react';
import { applyDefaultSeo, applySeo } from '../lib/seo';

export default function TermsAndConditions() {
  useEffect(() => {
    applySeo({
      title: 'Terms and Conditions | The Vajra',
      description:
        'Read the Terms and Conditions for using The Vajra platform, delivery services, and account features.',
      canonical: 'https://www.vajracognixia.in/terms-conditions',
    });

    return () => {
      applyDefaultSeo();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold text-white mb-2">Terms & Conditions</h1>
        <p className="text-gray-400 mb-8">Last updated: April 2026</p>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing and using The Vajra platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Use License</h2>
            <p className="mb-3">
              Permission is granted to temporarily download one copy of the materials (information or software) on The Vajra for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software contained on The Vajra</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
              <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
            <p>
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our service. You are responsible for safeguarding the password that you use to access the service and for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Order and Payment Terms</h2>
            <p className="mb-3">
              All orders placed on The Vajra are subject to acceptance and confirmation. We reserve the right to refuse any order you place with us. Payment for orders must be completed before delivery. We accept all standard payment methods.
            </p>
            <p>
              Prices are subject to change without notice. All items are subject to availability.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Intellectual Property Rights</h2>
            <p>
              Unless otherwise stated, The Vajra and/or its licensors own the intellectual property rights for all material on The Vajra. All intellectual property rights are reserved. You may access this from The Vajra for personal use subject to restrictions set in these terms and conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Limitation of Liability</h2>
            <p>
              In no event shall The Vajra or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on The Vajra, even if we or our authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Accuracy of Materials</h2>
            <p>
              The materials appearing on The Vajra could include technical, typographical, or photographic errors. The Vajra does not warrant that any of the materials on its platform are accurate, complete, or current. The Vajra may make changes to the materials contained on its platform at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Links</h2>
            <p>
              The Vajra has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by The Vajra of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Modifications</h2>
            <p>
              The Vajra may revise these terms of service for its platform at any time without notice. By using this platform, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of India, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
