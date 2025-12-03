import { Award, GraduationCap, Building2, Languages } from 'lucide-react';
import { Button } from './ui/button';
import { TeamMember } from '../data/teamMembers';
import { trackButtonClick } from '../utils/tracking';

interface DoctorCardProps {
  member: TeamMember;
  onBookNow: () => void;
}

export function DoctorCard({ member, onBookNow }: DoctorCardProps) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-[#096b17]/10 flex flex-col h-full" style={{ backgroundColor: '#FFFDBD' }}>
      {/* Image Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#096b17]/5 to-[#64CB81]/5">
        <div className="relative h-80">
          <img
            src={member.image}
            alt={member.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            loading='lazy'
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
        
        {/* Verified Badge */}
        <div className="absolute top-4 right-4 bg-[#64CB81] text-[#096b17] px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 shadow-lg">
          <Award className="h-3.5 w-3.5" />
          Verified
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl text-[#096b17] mb-2">{member.name}</h3>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-start gap-2 text-[#096b17] text-sm">
            <Award className="h-4 w-4 text-[#096b17] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-[#096b17]/70">Designation</p>
              <p>{member.designation}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 text-[#096b17] text-sm">
            <Building2 className="h-4 w-4 text-[#096b17] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-[#096b17]/70">Institute</p>
              <p>{member.institute}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 text-[#096b17] text-sm">
            <GraduationCap className="h-4 w-4 text-[#096b17] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-[#096b17]/70">Qualification</p>
              <p>{member.qualification}</p>
            </div>
          </div>
        </div>

        {/* Expertise Tags */}
        <div className="space-y-2 mb-4">
          <p className="text-xs text-[#096b17]/70 uppercase tracking-wide">Areas of Expertise</p>
          <div className="flex flex-wrap gap-2">
            {member.expertise.slice(0, 3).map((skill, idx) => (
              <span
                key={idx}
                className="text-xs bg-[#096b17]/10 text-[#096b17] px-2.5 py-1 rounded-lg border border-[#096b17]/20"
              >
                {skill}
              </span>
            ))}
            {member.expertise.length > 3 && (
              <span className="text-xs bg-[#096b17]/10 text-[#096b17] px-2.5 py-1 rounded-lg">
                +{member.expertise.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Languages */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-1.5">
            <Languages className="h-3.5 w-3.5 text-[#096b17]" />
            <p className="text-xs text-[#096b17]/70 uppercase tracking-wide">Languages</p>
          </div>
          <p className="text-sm text-[#096b17]">{member.languages.join(', ')}</p>
        </div>

        {/* Book Now Button */}
        <Button
          onClick={() => {
            trackButtonClick('Book Now - Doctor Card', 'doctor_profile', member.name);
            onBookNow();
          }}
          className="w-full mt-auto bg-[#096b17] hover:bg-[#075110] text-white h-11 rounded-lg"
        >
          Book Now
        </Button>
      </div>

      {/* Bottom accent */}
      <div className="h-1 bg-gradient-to-r from-[#096b17] to-[#64CB81]" />
    </div>
  );
}
