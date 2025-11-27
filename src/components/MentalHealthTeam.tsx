import { Award, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { DoctorCard } from './DoctorCard';
import { teamMembers } from '../data/teamMembers';

interface MentalHealthTeamProps {
  onViewAllTeam: () => void;
  onBookNow?: () => void;
}

export function MentalHealthTeam({ onViewAllTeam, onBookNow }: MentalHealthTeamProps) {
  const handleBookNow = () => {
    if (onBookNow) {
      onBookNow();
    } else {
      document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <section id="team" className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#096b17]/10 text-[#096b17] px-4 py-2 rounded-full mb-4 text-sm">
            <Award className="h-4 w-4" />
            <span>Expert Care Team</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-4">
            Our Mental Health Team
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Meet our compassionate team of licensed psychiatrists and psychologists from India's premier institutions
          </p>
        </div>

        {/* Horizontal Scrollable Team Cards */}
        <div className="relative mb-8">
          <div className="overflow-x-auto scrollbar-hide pb-4">
            <div className="flex gap-6" style={{ width: 'max-content' }}>
              {teamMembers.slice(0, 6).map((member, index) => (
                <div key={index} className="w-[340px] flex-shrink-0">
                  <DoctorCard 
                    member={member} 
                    onBookNow={handleBookNow}
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Scroll Indicator */}
          <div className="text-center text-sm text-gray-500 mt-4">
            <p className="flex items-center justify-center gap-2">
              Scroll to see more consultants
              <ChevronRight className="h-4 w-4 animate-pulse" />
            </p>
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button
            onClick={onViewAllTeam}
            variant="outline"
            size="lg"
            className="border-2 border-[#096b17] text-[#096b17] hover:bg-[#096b17] hover:text-white px-8 h-12 rounded-lg"
          >
            View All Consultants
          </Button>
        </div>

        {/* Stats Section */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-6">
            All our professionals are licensed, verified, and committed to providing evidence-based care
          </p>
          <div className="inline-flex flex-wrap justify-center items-center gap-6 md:gap-12 bg-white px-8 md:px-12 py-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="text-center">
              <div className="text-3xl md:text-4xl text-[#096b17] mb-2">1000+</div>
              <div className="text-sm text-gray-600">Happy Families</div>
            </div>
            <div className="w-px h-14 bg-gray-200"></div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl text-[#096b17] mb-2">100%</div>
              <div className="text-sm text-gray-600">Online Service</div>
            </div>
            <div className="w-px h-14 bg-gray-200"></div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl text-[#096b17] mb-2">100%</div>
              <div className="text-sm text-gray-600">Safe & Confidential</div>
            </div>
            <div className="w-px h-14 bg-gray-200"></div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl text-[#096b17] mb-2">100%</div>
              <div className="text-sm text-gray-600">Licensed Professionals</div>
            </div>
          </div>
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
      `}</style>
    </section>
  );
}
