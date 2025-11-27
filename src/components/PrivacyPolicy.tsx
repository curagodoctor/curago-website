import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';

interface PrivacyPolicyProps {
  trigger?: React.ReactNode;
}

export function PrivacyPolicy({ trigger }: PrivacyPolicyProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || <button className="hover:opacity-100 transition-opacity">Privacy Policy</button>}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">🛡️ Privacy Policy</DialogTitle>
          <DialogDescription>
            Read our privacy policy to understand how we collect, use, and protect your personal information.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6 text-sm text-gray-700">
            <p className="text-xs text-gray-500">Effective Date: 09/04/2025</p>

            <p>
              <strong>Curago Health Networking Private Limited</strong> ("Curago", "we", "our", "us") values your privacy and is committed to protecting your personal information.
              This Privacy Policy explains how we collect, use, store, and disclose your data when you access or use our website curago.in, our tools (including AURA RISE Index), or any online consultation services provided by our psychiatrists and psychologists.
            </p>

            <section>
              <h3 className="text-lg mb-3 text-gray-900">1. Information We Collect</h3>
              <p className="mb-3">We collect and process the following categories of personal data:</p>
              
              <h4 className="mb-2 text-gray-900">a. Personal Details:</h4>
              <p className="mb-3">Name, phone number, email address, date of birth, gender, and location.</p>

              <h4 className="mb-2 text-gray-900">b. Health Information:</h4>
              <p className="mb-3">Medical history, diagnosis, medications, consultation notes, and other details shared during sessions or through self-assessment tools.</p>

              <h4 className="mb-2 text-gray-900">c. Payment Data:</h4>
              <p className="mb-3">Information related to payments processed through Razorpay or Google Pay, including transaction IDs (we do not store full payment credentials).</p>

              <h4 className="mb-2 text-gray-900">d. Technical Data:</h4>
              <p>Cookies, IP address, browser type, device ID, and usage data collected through analytics and advertising tools such as Meta (Facebook) Pixel and Google Ads for retargeting and performance measurement.</p>
            </section>

            <section>
              <h3 className="text-lg mb-3 text-gray-900">2. How We Use Your Information</h3>
              <p className="mb-3">We process your data to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide online psychiatric consultations, therapy, and follow-up care.</li>
                <li>Generate and share e-prescriptions in compliance with Telemedicine Guidelines (2020).</li>
                <li>Contact you regarding appointments, service updates, and care continuity.</li>
                <li>Analyze usage trends and improve user experience.</li>
                <li>Send educational or awareness material (only with your consent).</li>
                <li>Display relevant advertisements and retarget users who have engaged with our content.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg mb-3 text-gray-900">3. Data Sharing and Disclosure</h3>
              <p className="mb-3">We may share your data only with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Registered medical practitioners, psychologists, and authorized staff of Curago.</li>
                <li>Payment processors (Razorpay, Google Pay) for completing transactions.</li>
                <li>Service providers for analytics, hosting, and communication (e.g., Meta, Google).</li>
                <li>Law enforcement or regulatory bodies when legally required.</li>
              </ul>
              <p className="mt-3"><strong>We do not sell or rent your personal data to third parties.</strong></p>
            </section>

            <section>
              <h3 className="text-lg mb-3 text-gray-900">4. Data Retention</h3>
              <p className="mb-3">
                Health and consultation records are securely stored and retained for a minimum of three (3) years as per Telemedicine Guidelines, unless you request deletion earlier.
              </p>
              <p>
                Non-medical data used for marketing or analytics may be retained for up to 24 months or until you opt out.
              </p>
            </section>

            <section>
              <h3 className="text-lg mb-3 text-gray-900">5. Data Security</h3>
              <p className="mb-3">
                We use industry-standard encryption, firewalls, and secure data centers to protect your information.
              </p>
              <p>
                However, no online transmission is fully secure — you share data with us at your own risk.
              </p>
            </section>

            <section>
              <h3 className="text-lg mb-3 text-gray-900">6. Your Rights</h3>
              <p className="mb-3">You may:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access or correct your data.</li>
                <li>Withdraw consent for processing.</li>
                <li>Request deletion of your records.</li>
                <li>Opt out of marketing or retargeting communications.</li>
              </ul>
              <p className="mt-3">Requests can be made via <a href="mailto:help@curago.in" className="text-[#096b17] hover:underline">help@curago.in</a>.</p>
            </section>

            <section>
              <h3 className="text-lg mb-3 text-gray-900">7. Cookies and Tracking</h3>
              <p>
                Our website and tools use cookies and tracking pixels (Meta, Google) to improve performance and deliver personalized experiences. You can disable cookies in your browser at any time.
              </p>
            </section>

            <section>
              <h3 className="text-lg mb-3 text-gray-900">8. Governing Law</h3>
              <p>
                This Privacy Policy is governed by the laws of India, and any disputes shall fall under the jurisdiction of courts in New Delhi, India.
              </p>
            </section>

            <section>
              <h3 className="text-lg mb-3 text-gray-900">9. Contact Us</h3>
              <p className="mb-3"><strong>Curago Health Networking Private Limited</strong></p>
              <ul className="space-y-1">
                <li>2/82 B, Thangavel Nagar, Alagapuram, Salem – 636016</li>
                <li>📧 <a href="mailto:help@curago.in" className="text-[#096b17] hover:underline">help@curago.in</a></li>
                <li>🌐 <a href="https://www.curago.in" className="text-[#096b17] hover:underline">www.curago.in</a></li>
              </ul>
            </section>

            <section className="border-t pt-6">
              <p className="text-xs text-gray-600">
                By using Curago's services, you acknowledge that you have read and understood this Privacy Policy and consent to the collection, use, and disclosure of your information as described herein.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
