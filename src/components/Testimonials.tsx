import React from "react";
import { Star, Quote } from "lucide-react";

type Testimonial = {
  id: number;
  quote: string;
  name: string;
  title: string;
  avatar: string; // picked to match gender of name
};

const CURAGO_GREEN = "#096b17";

/** ─────────────────────────────────────────────────────────────
 *  Row data: Indian names; avatars chosen to match gender
 *  (Unsplash portrait images; safe crop at 80×80)
 *  ────────────────────────────────────────────────────────────*/
const testimonials: Testimonial[] = [
  {
    id: 1,
    quote:
      "I was on the edge of burnout — deadlines, pressure, no time to breathe. My CuraGo psychiatrist actually listened and helped me find structure again. It felt human, not clinical.",
    name: "Rahul Mehta",
    title: "37, Software Engineer (Noida)",
    avatar:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=80&h=80&fit=crop", // male
  },
  {
    id: 2,
    quote:
      "I didn’t think an online session could make this much difference. The doctor gave practical steps, not just sympathy. Within two weeks, my sleep and focus improved.",
    name: "Sneha Kapoor",
    title: "32, Product Manager (Gurgaon)",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop", // female
  },
  {
    id: 3,
    quote:
      "I used to avoid therapy thinking it’s too complicated. CuraGo made it so easy — booked on WhatsApp, spoke same evening. Finally, someone understood the stress of tech life.",
    name: "Amit Sharma",
    title: "35, Data Analyst (Dwarka)",
    avatar:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?w=80&h=80&fit=crop", // male
  },
  {
    id: 4,
    quote:
      "Working from home had blurred all boundaries. My sessions on CuraGo helped me rebuild a healthy routine. It was like talking to someone who truly ‘got it’.",
    name: "Neha Verma",
    title: "29, UI/UX Designer (South Delhi)",
    avatar:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=80&h=80&fit=crop", // female
  },
  {
    id: 5,
    quote:
      "I was mentally exhausted but kept pushing through. CuraGo’s psychiatrist helped me slow down and see things clearly. Honestly, it brought balance back to my days.",
    name: "Rohit Bansal",
    title: "40, Tech Lead (Gurgaon)",
    avatar:
      "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?w=80&h=80&fit=crop", // male
  },
  {
    id: 6,
    quote:
      "Every session felt genuine — no rush, no judgment. The doctor patiently explained what burnout really means. I’ve started feeling lighter after years.",
    name: "Priya Nair",
    title: "34, QA Engineer (Noida)",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop", // female
  },
  {
    id: 7,
    quote:
      "I was skeptical about online consultations. But CuraGo’s psychiatrist made me feel comfortable from the first minute. Now I actually look forward to the sessions.",
    name: "Ankit Tiwari",
    title: "31, Backend Developer (Delhi NCR)",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop", // male
  },
  {
    id: 8,
    quote:
      "My anxiety had peaked during project sprints. CuraGo gave me tools to manage it, step by step. It’s like finally getting a reset button.",
    name: "Megha Choudhary",
    title: "28, Frontend Developer (Delhi)",
    avatar:
      "https://images.unsplash.com/photo-1544005316-04d3c9f1ae09?w=80&h=80&fit=crop", // female
  },
  {
    id: 9,
    quote:
      "Before CuraGo, therapy felt cold and disconnected. Here, it felt personal — they followed up, remembered details. That small effort made a huge difference.",
    name: "Vivek Sinha",
    title: "36, IT Consultant (Gurgaon)",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop", // male-ish alt not perfect; replace if needed
  },
  {
    id: 10,
    quote:
      "I didn’t expect empathy and structure to go hand in hand. CuraGo managed both — professional yet warm. I’m finally consistent with my sessions.",
    name: "Kavita Joshi",
    title: "30, DevOps Engineer (Noida)",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop", // female
  },
];

// Split into two rows (helps balance)
const testimonialsRowA = testimonials.slice(0, 5);
const testimonialsRowB = testimonials.slice(5);

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div className="w-[85vw] sm:w-[320px] md:w-[360px] lg:w-[380px] flex-shrink-0">
      <div className="h-full rounded-2xl bg-white ring-1 ring-black/5 shadow-md hover:shadow-lg transition p-5 sm:p-6 md:p-7">
        <Quote className="h-5 w-5 sm:h-6 sm:w-6 text-gray-300" />
        <p
          className="mt-3 sm:mt-4 text-gray-800 text-sm sm:text-base leading-relaxed whitespace-normal break-words"
          style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
        >
          “{t.quote}”
        </p>
        <div className="mt-5 sm:mt-6 flex items-center gap-3">
          <img
            src={t.avatar}
            alt={t.name}
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover ring-2 ring-white shadow"
          />
          <div>
            <p className="font-medium text-gray-900 text-sm sm:text-base">{t.name}</p>
            <p className="text-xs sm:text-sm text-gray-500">{t.title}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarqueeRow({
  items,
  speed = 36, // slower default
  direction = "left",
}: {
  items: Testimonial[];
  speed?: number; // seconds for one loop
  direction?: "left" | "right";
}) {
  return (
    <div className="marquee overflow-hidden relative">
      <div
        className={`marquee-track ${
          direction === "left" ? "marquee-anim-left" : "marquee-anim-right"
        }`}
        style={{ ["--marquee-duration" as any]: `${speed}s` }}
      >
        {[...items, ...items].map((t, i) => (
          <TestimonialCard key={`${t.id}-${i}`} t={t} />
        ))}
      </div>
    </div>
  );
}

export default function TestimonialsMarquee() {
  return (
    <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6">
      <div
        className="mx-auto max-w-7xl rounded-[24px] bg-white/95 ring-1 ring-black/5 p-5 sm:p-8 md:p-10 relative overflow-hidden"
        style={{ boxShadow: "0 30px 80px -40px rgba(0,0,0,0.25)" }}
      >
        {/* Badge */}
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-xs sm:text-sm shadow">
            <span
              className="flex items-center justify-center h-5 w-5 rounded-full"
              style={{ background: CURAGO_GREEN, boxShadow: "0 0 4px rgba(0,0,0,0.3)" }}
            >
              <Star className="h-3.5 w-3.5 text-white" fill="white" strokeWidth={0} />
            </span>
            <span className="relative top-[0.5px]">Rated 4.8/5 by 10k+ users</span>
          </span>
        </div>

        {/* Header */}
        <div className="text-center mt-6 sm:mt-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900">
            Words of praise for CuraGo
          </h2>
          <p className="mt-3 text-gray-600 text-sm sm:text-base md:text-lg">
            Real stories of better sleep, calmer days, and healthier routines.
          </p>
        </div>

        {/* Rows */}
        <div className="mt-10 sm:mt-14 space-y-6 sm:space-y-8">
          {/* Slightly different speeds; both slower than before */}
          <MarqueeRow items={testimonialsRowA} speed={36} direction="right" />
          <MarqueeRow items={testimonialsRowB} speed={40} direction="left" />
        </div>

        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-white to-transparent" />
      </div>

      {/* Marquee + mobile wrapping fixes */}
      <style>
        {`
          .marquee-track {
            display: flex;
            width: max-content;
            gap: 1.5rem;
            will-change: transform;
          }
          /* Ensure NO nowrap inside cards (fix for single-line text) */
          .marquee-track, .marquee-track * {
            white-space: normal !important;
          }

          @keyframes marquee-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes marquee-right {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          .marquee-anim-left {
            animation: marquee-left var(--marquee-duration, 36s) linear infinite;
          }
          .marquee-anim-right {
            animation: marquee-right var(--marquee-duration, 36s) linear infinite;
          }
          .marquee:hover .marquee-anim-left,
          .marquee:hover .marquee-anim-right {
            animation-play-state: paused;
          }

          @media (max-width: 640px) {
            .marquee-track { gap: 1rem; }
            /* Even slower on phones for readability */
            .marquee-anim-left,
            .marquee-anim-right {
              animation-duration: calc(var(--marquee-duration, 36s) * 1.4);
            }
            /* No pause-on-hover on touch */
            .marquee:hover .marquee-anim-left,
            .marquee:hover .marquee-anim-right {
              animation-play-state: running;
            }
          }
        `}
      </style>
    </section>
  );
}
