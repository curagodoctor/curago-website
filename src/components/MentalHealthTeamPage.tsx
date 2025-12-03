import { Award } from 'lucide-react';
import { DoctorCard } from './DoctorCard';
import { teamMembers } from '../data/teamMembers';

interface MentalHealthTeamPageProps {
  onBookAppointment: () => void;
}

export function MentalHealthTeamPage({ onBookAppointment }: MentalHealthTeamPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#096b17] via-[#075110] to-[#053d0b] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-full mb-4 text-sm">
            <Award className="h-4 w-4" />
            <span>Expert Care Team</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl text-white mb-4">
            Our Mental Health Team
          </h1>
          <p className="text-lg text-green-50 max-w-2xl mx-auto">
            Meet our compassionate team of licensed psychiatrists and psychologists from India's premier institutions
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {teamMembers.map((member, index) => (
            <DoctorCard 
              key={index} 
              member={member} 
              onBookNow={onBookAppointment}
            />
          ))}
        </div>

        {/* Stats Section */}
        <div className="text-center mt-16">
          <p className="text-green-50 mb-6">
            All our professionals are licensed, verified, and committed to providing evidence-based care
          </p>
          <div className="inline-flex flex-wrap justify-center items-center gap-6 md:gap-12 px-8 md:px-12 py-8 rounded-2xl backdrop-blur-sm border border-white/20" style={{ backgroundColor: '#FFFDBD' }}>
            <div className="text-center">
              <div className="text-3xl md:text-4xl text-[#096b17] mb-2">1000+</div>
              <div className="text-sm text-[#096b17]">Happy Families</div>
            </div>
            <div className="w-px h-14 bg-[#096b17]/20"></div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl text-[#096b17] mb-2">100%</div>
              <div className="text-sm text-[#096b17]">Online Service</div>
            </div>
            <div className="w-px h-14 bg-[#096b17]/20"></div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl text-[#096b17] mb-2">100%</div>
              <div className="text-sm text-[#096b17]">Safe & Confidential</div>
            </div>
            <div className="w-px h-14 bg-[#096b17]/20"></div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl text-[#096b17] mb-2">100%</div>
              <div className="text-sm text-[#096b17]">Licensed Professionals</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
