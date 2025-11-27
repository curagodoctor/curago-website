# Team Members Data

This directory contains the team members data that is used throughout the application.

## How to Update Team Members

To add, edit, or remove team members, simply modify the `teamMembers.ts` file.

### Structure

Each team member should have the following fields:

```typescript
{
  name: string;                 // Full name of the team member
  designation: string;          // Professional title
  institute: string;            // Educational institution
  qualification: string;        // Degrees and certifications
  expertise: string[];          // Array of specializations
  languages: string[];          // Array of languages spoken
  registrationNumber: string;   // Professional registration number
  image: string;                // URL to profile image
}
```

### Example

```typescript
{
  name: "Dr. John Doe",
  designation: "Senior Psychiatrist",
  institute: "AIIMS, New Delhi",
  qualification: "MD Psychiatry, MBBS",
  expertise: ["Anxiety Disorders", "Depression", "Stress Management"],
  languages: ["English", "Hindi"],
  registrationNumber: "MCI-12345",
  image: "https://example.com/image.jpg"
}
```

### Notes

- Changes to this file will automatically update both the homepage team carousel and the full team page
- The homepage shows the first 6 team members in a horizontally scrollable carousel
- The full team page displays all team members in a grid
- All team members appear on the dedicated `/mental-health-team` page accessible via the URL hash: `#mental-health-team`
