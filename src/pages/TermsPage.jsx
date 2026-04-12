import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg-primary px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline mb-8 transition-colors duration-200">
          ← Back to Promise Tracker
        </Link>

        <h1 className="text-3xl font-extrabold text-text-primary tracking-tight mb-2">Terms of Service</h1>
        <p className="text-sm text-text-muted mb-10">Last updated: April 12, 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-text-secondary">

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Promise Tracker ("Service"), operated by Promise Tracker ("Company," "we," "us," or "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service. These Terms constitute a legally binding agreement between you and Promise Tracker.
            </p>
            <p className="mt-2">
              The Service is a business-to-business (B2B) software-as-a-service (SaaS) platform designed for service businesses. By using the Service, you represent that you are acting on behalf of a business entity and have the authority to bind that entity to these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">2. Description of Service</h2>
            <p>
              Promise Tracker is a customer follow-up tracking tool designed for service businesses. The Service enables users to create, manage, and track promises made to customers, send SMS reminders and notifications, manage team members, and maintain accountability for customer commitments. The Service is provided via web application accessible at promisetracker.app.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">3. Account Registration</h2>
            <p>
              To use the Service, you must create an account by providing accurate and complete information, including your business name, email address, and phone number. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must notify us immediately of any unauthorized use of your account.
            </p>
            <p className="mt-2">
              You must be at least 18 years of age to create an account and use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">4. Free Trial</h2>
            <p>
              Promise Tracker offers a 21-day free trial for new accounts. The free trial provides full access to all features of the Service. No credit card is required to start a free trial. At the end of the 21-day trial period, you must subscribe to a paid plan to continue using the Service. We reserve the right to modify or discontinue the free trial offer at any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">5. Subscription and Billing</h2>
            <p>
              The Service is available on a monthly subscription basis at $39 per month. Your subscription will automatically renew each month on the anniversary of your subscription start date. Payment is processed through Stripe, our third-party payment processor. By subscribing, you authorize us to charge your payment method on file for the recurring subscription fee.
            </p>
            <p className="mt-2">
              We reserve the right to change subscription pricing with 30 days' prior notice. Price changes will take effect at the start of your next billing cycle following the notice period.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">6. Cancellation and Refunds</h2>
            <p>
              You may cancel your subscription at any time through your account settings. Upon cancellation, your subscription will remain active until the end of your current billing period. We do not provide prorated refunds for partial months. After cancellation, your access to the Service will continue until the end of the paid period, after which your account will be deactivated.
            </p>
            <p className="mt-2">
              If you believe you have been billed in error, please contact us at support@promisetracker.app within 30 days of the charge.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">7. User Responsibilities</h2>
            <p>As a user of the Service, you agree to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5">
              <li>Provide accurate and complete information when creating your account and using the Service.</li>
              <li>Use the Service only for lawful business purposes.</li>
              <li>Comply with all applicable laws and regulations, including those related to SMS communications (e.g., TCPA, CAN-SPAM).</li>
              <li>Obtain proper consent from your customers before sending SMS notifications through the Service.</li>
              <li>Keep your account credentials secure and confidential.</li>
              <li>Not share your account with unauthorized individuals.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">8. Prohibited Use</h2>
            <p>You may not use the Service to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5">
              <li>Send unsolicited or spam SMS messages.</li>
              <li>Harass, abuse, or harm any person.</li>
              <li>Violate any applicable law, regulation, or third-party rights.</li>
              <li>Attempt to gain unauthorized access to the Service or its systems.</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Service.</li>
              <li>Use the Service to compete with or build a similar product.</li>
              <li>Circumvent any access controls, rate limits, or usage restrictions.</li>
              <li>Upload or transmit malware, viruses, or other harmful code.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">9. Intellectual Property</h2>
            <p>
              The Service, including its design, features, functionality, code, and content, is owned by Promise Tracker and is protected by intellectual property laws. You are granted a limited, non-exclusive, non-transferable license to use the Service for its intended purpose during the term of your subscription. You retain ownership of all data you input into the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">10. Data Collection</h2>
            <p>
              We collect and process certain data to provide and improve the Service, including personal information (email, phone number, business name), usage data, browser fingerprints, IP addresses, and device identifiers. Browser and device data is collected for fraud prevention, abuse detection, and account security purposes. For full details on how we handle your data, please see our{' '}
              <Link to="/privacy" className="text-accent hover:underline">Privacy Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">11. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Promise Tracker and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, business, or goodwill, arising out of or in connection with your use of or inability to use the Service, even if we have been advised of the possibility of such damages.
            </p>
            <p className="mt-2">
              Our total aggregate liability for all claims arising out of or relating to these Terms or the Service shall not exceed the amount you paid to us in the twelve (12) months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">12. Disclaimer of Warranties</h2>
            <p>
              The Service is provided on an "as is" and "as available" basis, without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the Service will be uninterrupted, error-free, secure, or free of viruses or other harmful components. Your use of the Service is at your sole risk.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">13. Termination</h2>
            <p>
              We may suspend or terminate your access to the Service at any time, with or without cause, and with or without notice. Reasons for termination may include, but are not limited to, breach of these Terms, fraudulent activity, non-payment, or abuse of the Service. Upon termination, your right to use the Service ceases immediately. We may delete your account data within 90 days of termination unless required by law to retain it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">14. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms on the Service and updating the "Last updated" date. Your continued use of the Service after the effective date of any changes constitutes your acceptance of the revised Terms. If you do not agree to the updated Terms, you must stop using the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">15. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of Florida, United States, without regard to its conflict of law principles. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the state and federal courts located in the State of Florida.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">16. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="mt-2">
              <a href="mailto:support@promisetracker.app" className="text-accent hover:underline">support@promisetracker.app</a>
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-xs text-text-muted">
          <div className="flex items-center justify-center gap-4">
            <Link to="/privacy" className="hover:text-accent transition-colors duration-200">Privacy Policy</Link>
            <span>·</span>
            <Link to="/" className="hover:text-accent transition-colors duration-200">Promise Tracker</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
