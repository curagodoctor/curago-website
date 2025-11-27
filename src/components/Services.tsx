import { CheckCircle, Stethoscope, Users, Smartphone, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRef } from 'react';

export function Services() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section id="services" className="py-12 md:py-16 relative overflow-hidden" style={{ backgroundColor: '#FFFDBD' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Core Services Header */}
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ 
            duration: 1,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          <motion.h2 
            className="text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-2"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ 
              duration: 0.8,
              delay: 0.2,
              ease: [0.34, 1.56, 0.64, 1]
            }}
          >
            Meaningful Sessions and Therapy
          </motion.h2>
        </motion.div>

        {/* Horizontal Scrollable Services */}
        <div className="relative">
          <div 
            ref={scrollRef}
            className="overflow-x-auto scrollbar-hide pb-6 scroll-smooth"
            style={{
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div className="flex gap-6 md:gap-8 px-2" style={{ width: 'max-content' }}>
              
              {/* Service Card 1 */}
              <motion.div 
                className="w-[320px] md:w-[360px] flex-shrink-0 bg-[#096b17] rounded-2xl p-8 shadow-xl group cursor-pointer relative overflow-hidden"
                style={{ scrollSnapAlign: 'center' }}
                initial={{ opacity: 0, x: -80, rotateY: -15 }}
                whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  duration: 0.8,
                  delay: 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: -12, 
                  scale: 1.03,
                  rotateX: 5,
                  boxShadow: "0 25px 50px -12px rgba(9, 107, 23, 0.5)",
                  transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }
                }}
              >
                {/* Animated gradient overlay */}
                <motion.div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100"
                  style={{
                    background: 'linear-gradient(135deg, rgba(100, 203, 129, 0.1) 0%, transparent 50%, rgba(100, 203, 129, 0.1) 100%)',
                    backgroundSize: '200% 200%',
                  }}
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                />

                {/* Floating particles effect */}
                <div className="absolute inset-0 opacity-10">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-white rounded-full"
                      style={{
                        left: `${20 + i * 30}%`,
                        top: `${30 + i * 20}%`,
                      }}
                      animate={{
                        y: [-20, 20, -20],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 3 + i,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: i * 0.5
                      }}
                    />
                  ))}
                </div>

                <div className="relative z-10">
                  <motion.div 
                    className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm"
                    whileHover={{ 
                      scale: 1.15, 
                      rotate: 360,
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      transition: { 
                        duration: 0.6,
                        ease: [0.34, 1.56, 0.64, 1]
                      } 
                    }}
                  >
                    <Stethoscope className="h-7 w-7 text-white" />
                  </motion.div>
                  
                  <motion.h3 
                    className="text-white text-2xl mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    Comprehensive Consultation
                  </motion.h3>
                  
                  <ul className="space-y-3">
                    {[
                      'Secure Video Consultation',
                      '45 mins Duration (min)',
                      'Personalized Treatment Plans',
                      'Digital Prescriptions'
                    ].map((item, index) => (
                      <motion.li 
                        key={index}
                        className="flex items-start gap-3 text-white"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ 
                          delay: 0.4 + (index * 0.1),
                          duration: 0.5,
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                        whileHover={{ 
                          x: 5,
                          transition: { duration: 0.2 }
                        }}
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ 
                            delay: 0.5 + (index * 0.1),
                            type: "spring",
                            stiffness: 200,
                            damping: 10
                          }}
                        >
                          <CheckCircle className="h-5 w-5 text-[#64CB81] flex-shrink-0 mt-0.5" />
                        </motion.div>
                        <span>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              {/* Service Card 2 */}
              <motion.div 
                className="w-[320px] md:w-[360px] flex-shrink-0 bg-[#096b17] rounded-2xl p-8 shadow-xl group cursor-pointer relative overflow-hidden"
                style={{ scrollSnapAlign: 'center' }}
                initial={{ opacity: 0, x: -80, rotateY: -15 }}
                whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  duration: 0.8,
                  delay: 0.2,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: -12, 
                  scale: 1.03,
                  rotateX: 5,
                  boxShadow: "0 25px 50px -12px rgba(9, 107, 23, 0.5)",
                  transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }
                }}
              >
                {/* Animated gradient overlay */}
                <motion.div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100"
                  style={{
                    background: 'linear-gradient(135deg, rgba(100, 203, 129, 0.1) 0%, transparent 50%, rgba(100, 203, 129, 0.1) 100%)',
                    backgroundSize: '200% 200%',
                  }}
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                />

                {/* Floating particles effect */}
                <div className="absolute inset-0 opacity-10">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-white rounded-full"
                      style={{
                        left: `${20 + i * 30}%`,
                        top: `${30 + i * 20}%`,
                      }}
                      animate={{
                        y: [-20, 20, -20],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 3 + i,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: i * 0.5
                      }}
                    />
                  ))}
                </div>

                <div className="relative z-10">
                  <motion.div 
                    className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm"
                    whileHover={{ 
                      scale: 1.15, 
                      rotate: 360,
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      transition: { 
                        duration: 0.6,
                        ease: [0.34, 1.56, 0.64, 1]
                      } 
                    }}
                  >
                    <Users className="h-7 w-7 text-white" />
                  </motion.div>
                  
                  <motion.h3 
                    className="text-white text-2xl mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    Meaningful Session & Therapy
                  </motion.h3>
                  
                  <ul className="space-y-3">
                    {[
                      'CBT',
                      'Psychotherapy',
                      'Couple & Family Therapy',
                      'Mental Health Coach'
                    ].map((item, index) => (
                      <motion.li 
                        key={index}
                        className="flex items-start gap-3 text-white"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ 
                          delay: 0.5 + (index * 0.1),
                          duration: 0.5,
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                        whileHover={{ 
                          x: 5,
                          transition: { duration: 0.2 }
                        }}
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ 
                            delay: 0.6 + (index * 0.1),
                            type: "spring",
                            stiffness: 200,
                            damping: 10
                          }}
                        >
                          <CheckCircle className="h-5 w-5 text-[#64CB81] flex-shrink-0 mt-0.5" />
                        </motion.div>
                        <span>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              {/* Service Card 3 - WhatsApp Support */}
              <motion.div 
                className="w-[320px] md:w-[360px] flex-shrink-0 bg-[#096b17] rounded-2xl p-8 shadow-xl group cursor-pointer relative overflow-hidden"
                style={{ scrollSnapAlign: 'center' }}
                initial={{ opacity: 0, x: -80, rotateY: -15 }}
                whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  duration: 0.8,
                  delay: 0.3,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: -12, 
                  scale: 1.03,
                  rotateX: 5,
                  boxShadow: "0 25px 50px -12px rgba(9, 107, 23, 0.5)",
                  transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }
                }}
              >
                {/* Animated gradient overlay */}
                <motion.div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100"
                  style={{
                    background: 'linear-gradient(135deg, rgba(100, 203, 129, 0.1) 0%, transparent 50%, rgba(100, 203, 129, 0.1) 100%)',
                    backgroundSize: '200% 200%',
                  }}
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                />

                {/* Floating particles effect */}
                <div className="absolute inset-0 opacity-10">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-white rounded-full"
                      style={{
                        left: `${20 + i * 30}%`,
                        top: `${30 + i * 20}%`,
                      }}
                      animate={{
                        y: [-20, 20, -20],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 3 + i,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: i * 0.5
                      }}
                    />
                  ))}
                </div>

                <div className="relative z-10">
                  <motion.div 
                    className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm"
                    whileHover={{ 
                      scale: 1.15, 
                      rotate: 360,
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      transition: { 
                        duration: 0.6,
                        ease: [0.34, 1.56, 0.64, 1]
                      } 
                    }}
                  >
                    <Smartphone className="h-7 w-7 text-white" />
                  </motion.div>
                  
                  <motion.h3 
                    className="text-white text-2xl mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    WhatsApp Follow up & Support
                  </motion.h3>
                  
                  <ul className="space-y-3">
                    {[
                      'Instant Communication',
                      'Same day Follow ups',
                      'Quick Doubt Resolution',
                      'Regular Check-ins'
                    ].map((item, index) => (
                      <motion.li 
                        key={index}
                        className="flex items-start gap-3 text-white"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ 
                          delay: 0.6 + (index * 0.1),
                          duration: 0.5,
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                        whileHover={{ 
                          x: 5,
                          transition: { duration: 0.2 }
                        }}
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ 
                            delay: 0.7 + (index * 0.1),
                            type: "spring",
                            stiffness: 200,
                            damping: 10
                          }}
                        >
                          <CheckCircle className="h-5 w-5 text-[#64CB81] flex-shrink-0 mt-0.5" />
                        </motion.div>
                        <span>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>

            </div>
          </div>
          
          {/* Scroll Indicator */}
          <motion.div 
            className="text-center text-sm text-gray-600 mt-6 md:hidden"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1, duration: 0.6 }}
            animate={{ 
              opacity: [0.5, 1, 0.5],
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <span>Scroll to see all services</span>
              <motion.span
                className="inline-flex"
                animate={{ x: [0, 5, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </motion.span>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scroll-smooth {
          scroll-behavior: smooth;
        }
      `}</style>
    </section>
  );
}
