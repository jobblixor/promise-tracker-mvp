import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg-primary px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline mb-8 transition-colors duration-200">
          ← Back to Promise Tracker
        </Link>

        <h1 className="text-3xl font-extrabold text-text-primary tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-sm text-text-muted mb-10">Last updated: April 12, 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-text-secondary">

          <section>
            <p>
              Promise Tracker ("Company," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy describes how we collect, use, store, and share information when you use our customer follow-up tracking service at promisetracker.app ("Service"). By using the Service, you consent to the practices described in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">1. Information We Collect</h2>

            <h3 className="text-base font-semibold text-text-primary mt-4 mb-2">Personal Information</h3>
            <p>When you create an account or use the Service, we collect:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5">
              <li><strong className="text-text-primary">Email address</strong> — used for account authentication, communications, and notifications.</li>
              <li><strong className="text-text-primary">Phone number</strong> — used for account verification and SMS notifications.</li>
              <li><strong className="text-text-primary">Business name</strong> — used to identify your organization within the Service.</li>
              <li><strong className="text-text-primary">Password</strong> — stored in hashed form via Firebase Authentication; we never store or have access to your plaintext password.</li>
            </ul>

            <h3 className="text-base font-semibold text-text-primary mt-4 mb-2">Promise Data</h3>
            <p>
              We store the promise records you create within the Service, including customer names, descriptions, due dates, statuses, and any associated notes or follow-up information.
            </p>

            <h3 className="text-base font-semibold text-text-primary mt-4 mb-2">Usage Data</h3>
            <p>We automatically collect certain information when you access the Service, including:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5">
              <li><strong className="text-text-primary">IP address</strong> — collected for security monitoring, fraud prevention, and approximate geolocation.</li>
              <li><strong className="text-text-primary">Browser fingerprint hash</strong> — a hashed representation of browser characteristics used for fraud prevention and abuse detection. We do not store the raw fingerprint data.</li>
              <li><strong className="text-text-primary">Device UUID</strong> — a unique device identifier generated and stored locally, used for device recognition and account security.</li>
              <li><strong className="text-text-primary">Browser type and version</strong>, operating system, screen resolution, and language preferences.</li>
              <li><strong className="text-text-primary">Pages visited</strong>, features used, timestamps, and interaction patterns within the Service.</li>
            </ul>

            <h3 className="text-base font-semibold text-text-primary mt-4 mb-2">Payment Information</h3>
            <p>
              Payment information (credit card numbers, billing addresses) is collected and processed directly by Stripe, our third-party payment processor. We do not store your full credit card number on our servers. We may receive and store limited payment details from Stripe, such as the last four digits of your card and billing email, for record-keeping purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect for the following purposes:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5">
              <li>To provide, operate, and maintain the Service.</li>
              <li>To authenticate your identity and manage your account.</li>
              <li>To process payments and manage your subscription.</li>
              <li>To send SMS notifications and reminders related to your promises (via Twilio).</li>
              <li>To send transactional emails (account verification, password resets, billing receipts).</li>
              <li>To detect and prevent fraud, abuse, and unauthorized access using browser fingerprinting, IP address analysis, and device identification.</li>
              <li>To monitor and analyze usage patterns to improve the Service.</li>
              <li>To provide customer support.</li>
              <li>To comply with legal obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">3. Data Storage and Security</h2>
            <p>
              Your data is stored using Firebase (Google Cloud Platform) infrastructure, which employs industry-standard security measures including encryption at rest and in transit, regular security audits, and compliance with SOC 1, SOC 2, and SOC 3 standards.
            </p>
            <p className="mt-2">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">4. Third-Party Services</h2>
            <p>We use the following third-party services to operate the Service. Each has its own privacy policy governing the data they process:</p>

            <ul className="mt-3 space-y-3">
              <li>
                <strong className="text-text-primary">Stripe</strong> — Handles payment processing and subscription billing. Stripe collects and processes your payment information directly. See <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Stripe's Privacy Policy</a>.
              </li>
              <li>
                <strong className="text-text-primary">Twilio</strong> — Delivers SMS notifications and reminders to your customers. Phone numbers and message content are processed by Twilio. See <a href="https://www.twilio.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Twilio's Privacy Policy</a>.
              </li>
              <li>
                <strong className="text-text-primary">Firebase / Google Cloud</strong> — Provides authentication, database (Firestore), and hosting infrastructure. See <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Firebase Privacy and Security</a>.
              </li>
              <li>
                <strong className="text-text-primary">Cloudflare</strong> — Provides DNS management and email routing for our domain. See <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Cloudflare's Privacy Policy</a>.
              </li>
              <li>
                <strong className="text-text-primary">Vercel</strong> — Hosts and serves the web application. See <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Vercel's Privacy Policy</a>.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">5. Cookies and Local Storage</h2>
            <p>
              The Service uses browser local storage and session storage to maintain your authentication state, store preferences, and support device identification (device UUID). We do not use third-party tracking cookies or advertising cookies. Firebase Authentication may use cookies or similar technologies for session management.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">6. Data Retention</h2>
            <p>
              We retain your personal information and promise data for as long as your account is active or as needed to provide the Service. After account termination or cancellation, we may retain your data for up to 90 days before permanent deletion, unless we are required by law to retain it for a longer period. Anonymized and aggregated data may be retained indefinitely for analytical purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">7. Your Rights</h2>
            <p>Depending on your location, you may have the following rights regarding your personal information:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5">
              <li><strong className="text-text-primary">Access</strong> — You can request a copy of the personal data we hold about you.</li>
              <li><strong className="text-text-primary">Correction</strong> — You can request that we correct inaccurate or incomplete data.</li>
              <li><strong className="text-text-primary">Deletion</strong> — You can request that we delete your personal data, subject to legal retention requirements.</li>
              <li><strong className="text-text-primary">Portability</strong> — You can request your data in a structured, machine-readable format.</li>
              <li><strong className="text-text-primary">Objection</strong> — You can object to our processing of your personal data in certain circumstances.</li>
              <li><strong className="text-text-primary">Restriction</strong> — You can request that we restrict the processing of your personal data.</li>
            </ul>
            <p className="mt-3">
              <strong className="text-text-primary">For California residents (CCPA):</strong> You have the right to know what personal information we collect, request deletion of your data, and opt out of the sale of personal information. We do not sell your personal information to third parties.
            </p>
            <p className="mt-2">
              <strong className="text-text-primary">For EU/EEA residents (GDPR):</strong> Our legal basis for processing your data includes performance of a contract (providing the Service), legitimate interests (fraud prevention, security), and your consent where applicable.
            </p>
            <p className="mt-2">
              To exercise any of these rights, please contact us at <a href="mailto:support@promisetracker.app" className="text-accent hover:underline">support@promisetracker.app</a>. We will respond to your request within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">8. Children's Privacy</h2>
            <p>
              The Service is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from anyone under 18 years of age. If we become aware that we have collected personal information from a minor, we will take steps to delete that information promptly. If you believe we have inadvertently collected information from a minor, please contact us at <a href="mailto:support@promisetracker.app" className="text-accent hover:underline">support@promisetracker.app</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">9. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy on the Service and updating the "Last updated" date at the top of this page. Your continued use of the Service after any changes constitutes your acceptance of the updated Privacy Policy. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">10. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
            </p>
            <p className="mt-2">
              <a href="mailto:support@promisetracker.app" className="text-accent hover:underline">support@promisetracker.app</a>
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-xs text-text-muted">
          <div className="flex items-center justify-center gap-4">
            <Link to="/terms" className="hover:text-accent transition-colors duration-200">Terms of Service</Link>
            <span>·</span>
            <Link to="/" className="hover:text-accent transition-colors duration-200">Promise Tracker</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
