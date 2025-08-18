import TeamCard from '@/components/TeamCard/TeamCard'


/* ─────────────────────────
   DATA
───────────────────────── */
type TeamMember = {
  name: string
  about: string
  imageUrl: string
  email?: string
  socials?: {
    github?: string
    twitter?: string
    instagram?: string
    linkedin?: string
  }
}

const OFFICE_BEARERS: TeamMember[] = [
  {
    name: 'Mohan Prasath',
    about: 'Secretary',
    imageUrl: '/coordinators/MohanPrasath.jpg',
    email: 'hello@example.com',
    socials: { instagram: 'https://instagram.com/', linkedin: 'https://www.linkedin.com/' },
  },
  {
    name: 'Nivethithaa',
    about: 'Treasurer',
    imageUrl: '/coordinators/Nivethithaa.jpg',
    email: 'hello@example.com',
    socials: { instagram: 'https://instagram.com/', linkedin: 'https://www.linkedin.com/' },
  },
  {
    name: 'Kalaivanan',
    about: 'Event Coordinator',
    imageUrl: '/coordinators/Kalaivanan.jpg',
    email: 'hello@example.com',
    socials: { instagram: 'https://instagram.com/', linkedin: 'https://www.linkedin.com/' },
  },
  {
    name: 'Sanjay',
    about: 'Event Coordinator',
    imageUrl: '/coordinators/Sanjay.jpg',
    email: 'hello@example.com',
    socials: { instagram: 'https://instagram.com/', linkedin: 'https://www.linkedin.com/' },
  },
]

const DEV_TEAM: TeamMember[] = [
  {
    name: 'Praveen',
    about: 'Web Development Team Lead',
    imageUrl: '/coordinators/Praveen.JPG',
    email: 'hello@example.com',
    socials: { instagram: 'https://instagram.com/', linkedin: 'https://instagram.com/' },
  },
  {
    name: 'Jeffry Patrick',
    about: 'Backend Developer',
    imageUrl: '/coordinators/Jeffrypatrick.jpg',
    email: 'hello@example.com',
    socials: { instagram: 'https://instagram.com/', linkedin: 'https://www.linkedin.com/' },
  },
  {
    name: 'Mokesh',
    about: 'Frontend Developer and UI Designer',
    imageUrl: '/coordinators/Mokesh.jpg',
    email: 'hello@example.com',
    socials: { instagram: 'https://instagram.com/', linkedin: 'https://www.linkedin.com/' },
  },
//   {
//     name: 'Balaji',
//     about: 'Frontend Developer',
//     imageUrl: '/coordinators/Balaji.jpg',
//     email: 'hello@example.com',
//     socials: { github: 'https://github.com/', linkedin: 'https://www.linkedin.com/' },
//   },
]


/* ─────────────────────────
   CARD COMPONENT
───────────────────────── */


/* ─────────────────────────
   PAGE COMPONENT
───────────────────────── */
export default function TeamsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-accent-first via-accent-second to-accent-third flex flex-col items-center py-12">
      <h1 className="text-3xl font-extrabold text-[#6c63ff] mb-14 tracking-tight">Meet Our Team</h1>

      {/* Office Bearers */}
      <section className="w-full flex flex-col items-center mb-16">
        <h2 className="text-2xl font-bold text-gradient mb-8">Office Bearers</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {OFFICE_BEARERS.map((member, idx) => (
            <div
              key={idx}
            >
              <TeamCard {...member} />
            </div>
          ))}
        </div>
      </section>

      {/* Development Team */}
      <section className="w-full flex flex-col items-center">
        <h2 className="text-2xl font-bold text-gradient mb-8">Development Team</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {DEV_TEAM.map((member, idx) => (
            <div
              key={idx}
              
            >
              <TeamCard {...member} />
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
