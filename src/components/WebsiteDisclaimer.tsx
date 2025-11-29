import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';

interface WebsiteDisclaimerProps {
  trigger?: React.ReactNode;
}
  

export function WebsiteDisclaimer({ trigger }: WebsiteDisclaimerProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || <button className="hover:opacity-100 transition-opacity">Website Disclaimer</button>}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">⚠️ Website Disclaimer</DialogTitle>
          <DialogDescription>
            Important information about our telemedicine services and their limitations.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6 text-sm text-gray-700">
            <p className="text-xs text-gray-500">Effective Date: 09/04/2025</p>

            <section>
              <p className="mb-3 leading-relaxed">
                <strong>Curago Health Networking Private Limited</strong> ("Curago") provides online psychiatry and psychology consultations through qualified medical professionals in accordance with the <strong>Telemedicine Practice Guidelines (India, 2020)</strong>.
              </p>
            </section>

            <section>
              <h3 className="text-lg mb-3 text-gray-900">Not a Substitute for Emergency Care</h3>
              <p className="mb-3 leading-relaxed">
                The information, assessments, and advice shared on this platform are for general mental health guidance and ongoing care — they are <strong>not a substitute for in-person medical evaluation or emergency treatment</strong>.
              </p>
              <p className="mb-3 leading-relaxed">
                If you are experiencing <strong>suicidal thoughts, self-harm urges, or a medical emergency</strong>, please contact your nearest hospital or emergency helpline immediately.
              </p>
            </section>

            <section>
              <h3 className="text-lg mb-3 text-gray-900">Remote Care Acknowledgment</h3>
              <p className="mb-3 leading-relaxed">
                By using this platform, you acknowledge that your care is being provided remotely and consent to share relevant personal and health data for the purpose of online consultation and follow-up communication.
              </p>
            </section>

            <section>
              <h3 className="text-lg mb-3 text-gray-900">Professional Qualifications</h3>
              <p className="mb-3 leading-relaxed">
                All mental health professionals on this platform are licensed and registered with the Medical Council of India (MCI) or Rehabilitation Council of India (RCI), as applicable.
              </p>
            </section>

            <section>
              <h3 className="text-lg mb-3 text-gray-900">Limitation of Liability</h3>
              <p className="mb-3 leading-relaxed">
                While we strive to provide the highest quality of care, Curago does not guarantee specific outcomes. The effectiveness of treatment depends on various factors including individual circumstances, adherence to recommendations, and timely follow-up.
              </p>
            </section>

            <section>
              <h3 className="text-lg mb-3 text-gray-900">Telemedicine Limitations</h3>
              <p className="mb-3 leading-relaxed">
                Online consultations have certain limitations compared to in-person visits. Physical examinations cannot be conducted, and certain diagnostic procedures are not possible. In cases where in-person evaluation is necessary, our professionals will recommend the same.
              </p>
            </section>

            <section>
              <h3 className="text-lg mb-3 text-gray-900">Contact Information</h3>
              <p className="leading-relaxed">
                For any questions regarding this disclaimer or our services, please contact us at:
              </p>
              <ul className="list-none space-y-1 mt-2">
                <li>📧 Email: help@curago.in</li>
                <li>📞 Phone: +918062179639</li>
                <li>💬 WhatsApp: +917021227203</li>
              </ul>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
