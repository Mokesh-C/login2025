"use client";

import Link from 'next/link';

const alumni = [
  // Entrepreneur (orange circled)
  {
    name: "Mr. Nagarajan S",
    image: "https://www.psgtech.edu/educms/sorces/MCA/alum/Shanmugam%20Nagarajan.webp",
    position: "Cofounder and CPO [24]7.AI, Bengaluru",
    category: "Entrepreneur"
  },
  {
    name: "Mr. Ganesh Samarthyam",
    image: "https://www.psgtech.edu/educms/sorces/MCA/alum/Mr%20Ganesh%20Samarthyam.jpg",
    position: "Corporate Trainer, Co-founder of KonfHub Private Ltd., Bangalore",
    category: "Entrepreneur"
  },
  // Executives (blue circled)
  {
    name: "Mr. Suresh M",
    image: "https://www.psgtech.edu/educms/sorces/MCA/alum/1722567702.jpg",
    position: "Insurance and Healthcare, Chairman, TCS, North America",
    category: "Executives"
  },
  {
    name: "Mr. Madheswaran R",
    image: "https://www.psgtech.edu/educms/sorces/MCA/alum/R%20Madheswaran.jpg",
    position: "Senior Software Development Engineer, Amazon",
    category: "Executives"
  },
  {
    name: "Mr. Ravi Gurusamy",
    image: "https://www.psgtech.edu/educms/sorces/MCA/alum/RaviGurusamy-89MX.jpg",
    position: "Manager, Deloitte Consulting LLP, Alpharetta, Georgia, United States",
    category: "Executives"
  },
  // Academia (red circled)
  {
    name: "Dr. S.R. Balasundaram",
    image: "https://www.psgtech.edu/educms/sorces/MCA/alum/1700736612.jpg",
    position: "Professor, Department of CA, NIT, Trichy",
    category: "Academia"
  },
  {
    name: "Dr. E. S. Samundeeswari",
    image: "https://www.psgtech.edu/educms/sorces/MCA/alum/1700197278.jpg",
    position: "Associate Professor, Department of CS, Vellalar College for Women",
    category: "Academia"
  },
  {
    name: "Dr. N. Mohanraj",
    image: "https://www.psgtech.edu/educms/sorces/MCA/alum/1700195295.jpg",
    position: "Associate Professor, Department of AMCS, PSG College of Technology",
    category: "Academia"
  },
];

const categories = [
  { key: "Entrepreneur", label: "Entrepreneur" },
  { key: "Executives", label: "Executives" },
  { key: "Academia", label: "Academia" },
];

export default function AlumniPage() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-br from-accent-first via-accent-second to-accent-third py-12 px-4 overflow-x-visible"> {/*bg-[#e0e5ec]*/}
      {/* Source link */}
      <Link
        href="https://www.psgtech.edu/alumni.php"
        target="_blank"
        rel="noopener noreferrer"
        className="relative botton-5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 px-4 py-2  rounded-lg shadow"
      >
        Source &rarr;
      </Link>
      <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-10 text-white drop-shadow-sm pt-8 md:pt-2">
        Our Distinguished Alumni
      </h1>
      <div className="flex flex-col gap-16 items-center">
        {categories.map(cat => (
          <div key={cat.key} className="w-full max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold  mb-10 text-center text-gradient">{cat.label}</h1>
            <div className="flex flex-wrap gap-16 w-full justify-center items-start">
              {alumni.filter(a => a.category === cat.key).map((a, i) => (
                <div
                  key={a.name}
                  className="flex flex-col items-center group"
                  style={{ width: 300, height: 360 }}
                >
                  <div
                    className="flex items-center justify-center mb-0 transition-transform duration-300 group-hover:-translate-y-4"
                    style={{
                      width: 190,
                      height: 190,
                      borderRadius: "50%",
                      background: "#e0e5ec",
                      //boxShadow: "9px 9px 16px #b8bac0, -9px -9px 16px #ffffff",
                      position: "relative",
                      zIndex: 2,
                    }}
                  >
                    <div
                      className="flex items-center justify-center"
                      style={{
                        width: 150,
                        height: 150,
                        borderRadius: "50%",
                        background: "#e0e5ec",
                        boxShadow: "inset 6px 6px 12px #b8bac0, inset -6px -6px 12px #ffffff",
                      }}
                    >
                      <img
                        src={a.image}
                        alt={a.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-[#e0e5ec]"
                        style={{
                          width: 120,
                          height: 120,
                          boxShadow: "0 2px 8px #b8bac0, 0 -2px 8px #ffffff",
                        }}
                      />
                    </div>
                  </div>
                  <div
                    className="w-full mt-6 transition-transform duration-300 group-hover:-translate-y-4 delay-75"
                    style={{
                      width: 270,
                      height:100,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      className="w-full rounded-sm rounded-bl-3xl rounded-tr-3xl rounded-br-3xl  py-5 px-4 text-center"
                      style={{
                        width: 270,
                        background: "#e0e5ec",
                        // boxShadow: `
                        //   8px 8px 16px #b8bac0,
                        //   -8px -8px 16px #ffffff,
                        //   inset 1px 1px 2px #ffffff,
                        //   inset -1px -1px 2px #b8bac0
                        // `,
                      }}
                    >
                      <div className="font-bold text-lg text-gray-800 mb-1">{a.name}</div>
                      <div className="text-sm text-gray-700  mb-1">{a.position}</div>
                      <span className="inline-block text-[#8b5cf6] mt-1 px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: "#e0e5ec",
                          boxShadow: "inset 1px 1px 3px #b8bac0, inset -1px -1px 3px #ffffff",
                        }}>
                        {a.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* See More */}
      <div className="mt-12 flex justify-center">
        <Link
          href="https://www.psgtech.edu/alumni.php"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow"
        >
          See More
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
