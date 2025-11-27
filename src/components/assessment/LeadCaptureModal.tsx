// src/components/LeadCaptureModal.tsx
import { useEffect, useRef, useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { X } from 'lucide-react';

const BRAND = '#096b17';
const WEBHOOK = 'https://server.wylto.com/webhook/oFClXjgvHUCq5l0qpU';

export type LeadPayload = {
  name: string;
  whatsapp: string; // 10 digits UI, we'll send +91XXXXXXXXXX
  email?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  defaultName?: string;
  onSubmitted?: (lead: LeadPayload) => void;
  source: 'quiz' | 'results';
};

export default function LeadCaptureModal({
  open,
  onClose,
  defaultName = '',
  onSubmitted,
  source,
}: Props) {
  const [name, setName] = useState(defaultName);
  const [wa, setWa] = useState(''); // 10 digits only
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const once = useRef(false);
  const waDigits = wa.replace(/\D/g, '').slice(0, 10);
  const valid = name.trim().length > 0 && waDigits.length === 10 && consent && !pending;

  useEffect(() => {
    if (open) {
      setError(null);
      // prevent background scroll
      const prev = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.documentElement.style.overflow = prev;
      };
    }
  }, [open]);

  const submit = async () => {
    if (!valid) return;
    if (once.current) return;
    once.current = true;
    setPending(true);
    setError(null);
    try {
      const payload = {
        action: 'lead_capture',
        source,
        contact: {
          name: name.trim(),
          whatsapp: `+91${waDigits}`,
          email: email || '',
        },
        timestamp: new Date().toISOString(),
      };

      const res = await fetch(WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(`Webhook ${res.status}: ${t}`);
      }

      onSubmitted?.({
        name: name.trim(),
        whatsapp: waDigits,
        email,
      });

      onClose();
    } catch (e) {
      setError('Could not submit. Please try again.');
      once.current = false; // allow retry
    } finally {
      setPending(false);
    }
  };

  const onFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex px-3 sm:px-4 pt-4 sm:pt-0"
          // Mobile: bottom sheet; Desktop: centered
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          // Layout: bottom aligned on mobile so the keyboard doesn't overlap
          style={{ alignItems: 'flex-end' }}
          role="dialog"
          aria-modal="true"
          aria-label="Lead capture"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => !pending && onClose()} />

          {/* Sheet / Modal */}
          <motion.div
            // Mobile: full width, rounded top; Desktop: max-w-md and centered style
            className="
              relative w-full sm:max-w-md sm:mx-auto
              rounded-t-2xl sm:rounded-2xl
              bg-white shadow-2xl
              overflow-hidden
            "
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 170, damping: 20 }}
            // Keep content scrollable within the viewport (handles small phones & keyboard)
            style={{
              maxHeight: '85vh',
              // allow inner scroll; keep tap area clear of device home indicator
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            {/* Close button (comfortable touch target) */}
            <button
              onClick={() => !pending && onClose()}
              className="absolute right-2.5 top-2.5 p-3 rounded-full hover:bg-black/5 active:bg-black/10"
              aria-label="Close"
              disabled={pending}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Scroll container */}
            <div className="overflow-y-auto">
              <div className="px-5 sm:px-6 pt-6 pb-5">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 text-center">
                  Get your full insights
                </h3>
                <p className="text-sm text-gray-600 text-center mt-1">
                  Get detailed pillar-by-pillar interpretations and personalised next steps.
                </p>

                <form onSubmit={onFormSubmit} className="mt-5 space-y-4">
                  <div>
                    <Label>Name *</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      // Avoid iOS zoom by ensuring >=16px font-size
                      className="text-base"
                    />
                  </div>

                  <div>
                    <Label>WhatsApp Number *</Label>
                    <div className="flex items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-[rgba(9,107,23,0.25)]">
                      <span className="px-3 text-sm font-medium" style={{ color: BRAND }}>
                        +91
                      </span>
                      <input
                        className="flex-1 h-11 px-3 outline-none bg-transparent text-base"
                        // 'tel' behaves better on mobile than pattern-only numeric
                        type="tel"
                        inputMode="numeric"
                        placeholder="10-digit number"
                        value={waDigits}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setWa(v);
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Email (optional)</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="text-base"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                    />
                    I agree to get insights on WhatsApp and email.
                  </label>

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  {/* Primary submit */}
                  <Button
                    type="submit"
                    disabled={!valid}
                    className="w-full rounded-xl text-white h-11"
                    style={{ backgroundColor: BRAND }}
                  >
                    {pending ? 'Submitting…' : 'Get Full Insights'}
                  </Button>

                  {/* NEW: Skippable path */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={pending}
                    className="w-full rounded-xl h-11 border border-gray-300 text-gray-700"
                  >
                    Skip for now
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
