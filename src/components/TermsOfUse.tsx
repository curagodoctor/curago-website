import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';

interface TermsOfUseProps {
  trigger?: React.ReactNode;
}

export function TermsOfUse({ trigger }: TermsOfUseProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || <button className="hover:opacity-100 transition-opacity">Terms of Use</button>}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">⚖️ Terms of Use</DialogTitle>
          <DialogDescription>
            Read our terms of use and website disclaimer to understand the conditions for using our services.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6 text-sm text-gray-700">
            <p className="text-xs text-gray-500">Effective Date: 9/4/2025</p>

            <p>
              These Terms of Use ("Terms") govern your access to and use of <strong>Curago Health Networking Private Limited's</strong> website, tools, and telemedicine services. By using our services, you agree to these Terms.
            </p>

            <section>
              <h3 className="text-lg mb-3 text-gray-900">1. Eligibility</h3>
              <p>
                You must be 18 years or older to use our services. By booking a consultation, you represent that all information you provide is true and accurate.
              </p>
            </section>

            <section>
              <h3 className="text-lg mb-3 text-gray-900">2. Nature of Services</h3>
              <p className="mb-3">Curago provides:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Online psychiatry and psychology consultations.</li>
                <li>Telemedicine-based e-prescriptions.</li>
                <li>Free tools and self-assessment services (e.g., AURA RISE Index)</li>
              </ul>
              <p className="mt-3">
                Consultations are conducted by licensed practitioners in accordance with the <strong>Telemedicine Practice Guidelines (India, 2020)</strong>.
              </p>
            </section>

            <section>
              <h3 className="text-lg mb-3 text-gray-900">3. Website Disclaimer</h3>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-3">
                <p className="mb-3 leading-relaxed">
                  <strong>Curago Health Networking Private Limited</strong> ("Curago") provides online psychiatry and psychology consultations through qualified medical professionals in accordance with the <strong>Telemedicine Practice Guidelines (India, 2020)</strong>.
                </p>
                
                <h4 className="text-gray-900 mb-2">Not a Substitute for Emergency Care</h4>
                <p className="mb-3 leading-relaxed">
                  The information, assessments, and advice shared on this platform are for general mental health guidance and ongoing care — they are <strong>not a substitute for in-person medical evaluation or emergency treatment</strong>.
                </p>
                <p className="mb-3 leading-relaxed">
                  If you are experiencing <strong>suicidal thoughts, self-harm urges, or a medical emergency</strong>, please contact your nearest hospital or emergency helpline immediately.
                </p>
                
                <h4 className="text-gray-900 mb-2">Remote Care Acknowledgment</h4>
                <p className="mb-3 leading-relaxed">
                  By using this platform, you acknowledge that your care is being provided remotely and consent to share relevant personal and health data for the purpose of online consultation and follow-up communication.
                </p>
                
                <h4 className="text-gray-900 mb-2">Professional Qualifications</h4>
                <p className="mb-3 leading-relaxed">
                  All mental health professionals on this platform are licensed and registered with the Medical Council of India (MCI) or Rehabilitation Council of India (RCI), as applicable.
                </p>
                
                <h4 className="text-gray-900 mb-2">Telemedicine Limitations</h4>
                <p className="leading-relaxed">
                  Online consultations have certain limitations compared to in-person visits. Physical examinations cannot be conducted, and certain diagnostic procedures are not possible. In cases where in-person evaluation is necessary, our professionals will recommend the same.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-lg mb-3 text-gray-900">4. Medical Disclaimer</h3>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-3">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Online consultations are not a replacement for emergency or in-person medical care.</li>
                  <li>If you are in a life-threatening situation, please contact your local emergency services immediately.</li>
                  <li>Curago and its practitioners make reasonable efforts to ensure accuracy but do not guarantee specific outcomes.</li>
                  <li>The effectiveness of treatment depends on various factors including individual circumstances, adherence to recommendations, and timely follow-up.</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg mb-3 text-gray-900">5. User Obligations</h3>
              <p className="mb-3">You agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate medical and personal information.</li>
                <li>Refrain from misusing the platform or impersonating another person.</li>
                <li>Use the services only for personal, lawful purposes.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg mb-3 text-gray-900">6. Payments and Refunds</h3>
              <p className="mb-3">
                All payments are processed securely via Razorpay or Google Pay.
              </p>
              <p>
                Fees once paid for consultations are non-refundable except in cases of technical failure or provider unavailability, as determined by Curago's support team.
              </p>
            </section>

            <section>
              <h3 className="text-lg mb-3 text-gray-900">7. Intellectual Property</h3>
              <p>
                All content on curago.in (videos, articles, assessments, graphics) is owned by Curago Health Networking Private Limited. You may not reproduce or distribute without written permission.
              </p>
            </section>

            <section>
              <h3 className="text-lg mb-3 text-gray-900">8. Limitation of Liability</h3>
              <p className="mb-3">Curago and its affiliates are not liable for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Interruptions in telecommunication or internet services.</li>
                <li>Loss of data due to user error or third-party breaches beyond our control.</li>
                <li>Any indirect, incidental, or consequential damages.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg mb-3 text-gray-900">9. Termination</h3>
              <p>
                Curago reserves the right to suspend or terminate access for violations of these Terms or misuse of the platform.
              </p>
            </section>

            <section>
              <h3 className="text-lg mb-3 text-gray-900">10. Modifications</h3>
              <p>
                Curago may update these Terms periodically. Continued use of the platform constitutes acceptance of any revisions.
              </p>
            </section>

            <section>
              <h3 className="text-lg mb-3 text-gray-900">11. Governing Law and Jurisdiction</h3>
              <p>
                These Terms are governed by the laws of India, and any disputes shall be subject to the exclusive jurisdiction of the courts of New Delhi, India.
              </p>
            </section>

            <section>
              <h3 className="text-lg mb-3 text-gray-900">Contact:</h3>
              <ul className="space-y-1">
                <li>📧 <a href="mailto:help@curago.in" className="text-[#096b17] hover:underline">help@curago.in</a></li>
                <li>📞 Phone: +917021227203</li>
                <li>💬 WhatsApp: +917021227203</li>
                <li>🏢 Curago Health Networking Private Limited</li>
                <li>2/82 B, Thangavel Nagar, Alagapuram, Salem – 636016</li>
              </ul>
            </section>

            <section className="border-t pt-6">
              <p className="text-xs text-gray-600">
                By using Curago's services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
