import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/card';

export default function CalmTermsAndConditions() {
  return (
    <div className="min-h-screen bg-[#F5F5DC] pt-24 pb-12 px-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#096b17' }}>
            Terms & Conditions — CuraGo's Anxiety Loop Assessment Tool 1.0
          </h1>
          <p className="text-lg" style={{ color: '#096b17' }}>
            Professional Anxiety Assessment
          </p>
          <p className="text-sm mt-2" style={{ color: '#096b17' }}>
            Last updated: 21/12/2025
          </p>
        </motion.div>

        <Card className="p-8 md:p-12 bg-white border-2 border-[#096b17]/20 shadow-lg">
          <div className="prose prose-lg max-w-none" style={{ color: '#096b17' }}>
            <p className="text-base mb-6 leading-relaxed">
              By purchasing or accessing CuraGo's Anxiety Loop Assessment Tool 1.0, you agree to the following Terms & Conditions.
              Please read them carefully.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#096b17' }}>
                1. What CuraGo's Anxiety Loop Assessment Tool 1.0 Is (Important)
              </h2>
              <p className="mb-4 leading-relaxed">
                CuraGo's Anxiety Loop Assessment Tool 1.0 is a paid psychometric assessment designed to help users understand
                patterns related to anxiety, including triggers, reinforcement mechanisms, and recovery
                capacity.
              </p>
              <p className="mb-3 leading-relaxed">CuraGo's Anxiety Loop Assessment Tool 1.0:</p>
              <ul className="list-disc ml-6 mb-4 space-y-2">
                <li>is not a diagnostic tool</li>
                <li>does not provide medical advice</li>
                <li>does not replace consultation with a mental health professional</li>
                <li>does not prescribe therapy, medication, or treatment</li>
              </ul>
              <p className="leading-relaxed">
                The report generated is intended for informational and self-understanding purposes
                only.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#096b17' }}>
                2. What CuraGo's Anxiety Loop Assessment Tool 1.0 Is Not
              </h2>
              <p className="mb-3 leading-relaxed">CuraGo's Anxiety Loop Assessment Tool 1.0 is not:</p>
              <ul className="list-disc ml-6 mb-4 space-y-2">
                <li>a medical diagnosis</li>
                <li>a substitute for psychiatric or psychological evaluation</li>
                <li>an emergency or crisis support service</li>
                <li>a guarantee of symptom relief or outcomes</li>
              </ul>
              <p className="leading-relaxed">
                If you are experiencing severe distress, thoughts of self-harm, or a mental health
                emergency, you should seek immediate professional or emergency help.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#096b17' }}>
                3. One-Time Access & Usage Policy
              </h2>
              <ul className="list-disc ml-6 mb-4 space-y-2">
                <li>Each CuraGo's Anxiety Loop Assessment Tool 1.0 purchase provides one-time access to the assessment.</li>
                <li>Access is securely linked to the purchaser and cannot be transferred, shared,
                  forwarded, or reused.</li>
                <li>Once the assessment is submitted, access to the assessment expires
                  permanently.</li>
                <li>The generated report remains available as a read-only document.</li>
              </ul>
              <p className="leading-relaxed">
                Any attempt to reuse, duplicate, or misuse the assessment may result in access being
                revoked.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#096b17' }}>
                4. Delayed Use ("Take It Later")
              </h2>
              <ul className="list-disc ml-6 mb-4 space-y-2">
                <li>You may choose to start the assessment at a later time after payment.</li>
                <li>The assessment remains accessible until it is submitted or expires as per system
                  rules.</li>
                <li>Once submitted, the assessment cannot be restarted or retaken without a new
                  purchase.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#096b17' }}>
                5. Refund & Cancellation Policy
              </h2>

              <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: '#096b17' }}>
                a. Cancellation Before Starting the Assessment
              </h3>
              <ul className="list-disc ml-6 mb-4 space-y-2">
                <li>You may cancel before starting the assessment.</li>
                <li>A cancellation fee of 10% of the paid amount will be deducted.</li>
                <li>The remaining amount will be refunded to the original payment method within 5 to 7
                  business days.</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: '#096b17' }}>
                b. After Assessment Has Started
              </h3>
              <ul className="list-disc ml-6 mb-4 space-y-2">
                <li>Once the assessment is started, no refunds are provided, even if it is not
                  completed.</li>
                <li>This is because the assessment session is unlocked and reserved for individual use.</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: '#096b17' }}>
                c. After Assessment Submission
              </h3>
              <ul className="list-disc ml-6 mb-4 space-y-2">
                <li>No refunds are provided after submission of the assessment and generation of the
                  report.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#096b17' }}>
                6. Consultation Credit Adjustment (If Applicable)
              </h2>
              <p className="mb-4 leading-relaxed">
                If you choose to book a consultation with CuraGo after completing CuraGo's Anxiety Loop Assessment Tool 1.0:
              </p>
              <ul className="list-disc ml-6 mb-4 space-y-2">
                <li>50% of the CuraGo's Anxiety Loop Assessment Tool 1.0 amount may be adjusted against the consultation fee, subject
                  to current platform policies.</li>
              </ul>
              <p className="leading-relaxed">
                This adjustment is optional and not mandatory.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#096b17' }}>
                7. No Guarantee of Outcomes
              </h2>
              <p className="mb-3 leading-relaxed">CuraGo does not guarantee:</p>
              <ul className="list-disc ml-6 mb-4 space-y-2">
                <li>specific emotional outcomes</li>
                <li>reduction in anxiety symptoms</li>
                <li>suitability of any particular clinical pathway</li>
              </ul>
              <p className="leading-relaxed">
                Responses and interpretations are based entirely on self-reported information provided by
                the user.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#096b17' }}>
                8. User Responsibility
              </h2>
              <p className="mb-3 leading-relaxed">By using CuraGo's Anxiety Loop Assessment Tool 1.0, you confirm that:</p>
              <ul className="list-disc ml-6 mb-4 space-y-2">
                <li>you are providing information honestly and to the best of your ability</li>
                <li>you understand the scope and limitations of the assessment</li>
                <li>you take responsibility for decisions made based on the report</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#096b17' }}>
                9. Data Privacy & Confidentiality
              </h2>
              <ul className="list-disc ml-6 mb-4 space-y-2">
                <li>Your data is treated as confidential.</li>
                <li>Assessment responses and reports are securely stored.</li>
                <li>CuraGo does not sell or share your personal data with third parties.</li>
              </ul>
              <p className="leading-relaxed">
                For more details, please refer to our Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#096b17' }}>
                10. Right to Modify or Discontinue
              </h2>
              <p className="mb-3 leading-relaxed">CuraGo reserves the right to:</p>
              <ul className="list-disc ml-6 mb-4 space-y-2">
                <li>update or modify CuraGo's Anxiety Loop Assessment Tool 1.0</li>
                <li>revise these Terms & Conditions</li>
                <li>discontinue the assessment at any time</li>
              </ul>
              <p className="leading-relaxed">
                Any changes will apply prospectively.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#096b17' }}>
                11. Jurisdiction
              </h2>
              <p className="mb-4 leading-relaxed">
                These Terms & Conditions are governed by the laws of India.
              </p>
              <p className="leading-relaxed">
                Any disputes shall be subject to the jurisdiction of the appropriate courts.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#096b17' }}>
                12. Contact Information
              </h2>
              <p className="mb-3 leading-relaxed">
                For questions or support related to CuraGo's Anxiety Loop Assessment Tool 1.0, please contact:
              </p>
              <ul className="list-none mb-4 space-y-2">
                <li>📧 <a href="mailto:curagodoctor@gmail.com" className="underline hover:text-[#075110]">curagodoctor@gmail.com</a></li>
                <li>📞 <a href="tel:08062179639" className="underline hover:text-[#075110]">08062179639</a></li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#096b17' }}>
                Acknowledgement
              </h2>
              <p className="leading-relaxed">
                By proceeding with payment and accessing CuraGo's Anxiety Loop Assessment Tool 1.0, you acknowledge that you have
                read, understood, and agreed to these Terms & Conditions.
              </p>
            </section>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <a
            href="/calm"
            className="inline-block bg-[#096b17] text-white hover:bg-[#075110] px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Back to Assessment
          </a>
        </div>
      </div>
    </div>
  );
}
