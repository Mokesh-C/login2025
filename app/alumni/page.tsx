"use client";

import Link from 'next/link';
import Image from 'next/image';

const alumni = [
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
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-br from-accent-first via-accent-second to-accent-third py-12 px-4 overflow-x-visible font-manrope">
      {/* Source link */}
      <Link
        href="https://www.psgtech.edu/alumni.php"
        target="_blank"
        rel="noopener noreferrer"
        className="relative botton-5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg shadow"
      >
        Source &rarr;
      </Link>
      <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-10 text-white drop-shadow-sm pt-8 md:pt-2">
        Our Distinguished Alumni
      </h1>
      <div className="flex flex-col gap-16 items-center">
        {categories.map(cat => (
          <div key={cat.key} className="w-full max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-10 text-center text-gradient">{cat.label}</h1>
            <div className="flex flex-wrap gap-16 w-full justify-center items-start">
              {alumni.filter(a => a.category === cat.key).map((a, i) => (
                <div
                  key={a.name}
                  className="relative w-[340px] h-[340px] rounded-[5%_5%_5%_5%]  hover:rounded-[2%_15%_15%_15%] hover:transition-all duration-300 bg-[#e0e5ec] overflow-hidden  cursor-pointer text-white group"
                  aria-label={`Alumni card ${a.name}`}
                >
                  {/* Info Icon */}
                  <div className="absolute top-6 right-6 w-9 h-9 bg-[#e0e5ec] rounded-full text-[#5028b0] font-bold text-xl leading-9 text-center shadow-[2px_2px_6px_#b8bac0,-2px_-2px_6px_#ffffff] z-10 transition-all duration-300 group-hover:text-purple-500 group-hover:shadow-[inset_2px_2px_6px_#b8bac0,inset_-2px_-2px_6px_#ffffff]">
                    &#9432;
                  </div>

                  {/* Overlay */}
                  <div className="absolute top-6 right-6 w-9 h-9 rounded-full bg-[#e0e5ec] z-[1] shadow-[2px_2px_6px_#b8bac0,-2px_-2px_6px_#ffffff] transition-all duration-300 ease-in-out group-hover:w-[85%] group-hover:h-[85%] group-hover:rounded-[50%_15%_15%_15%] group-hover:shadow-[inset_6px_6px_12px_#b8bac0,inset_-6px_-6px_12px_#ffffff]" />

                  {/* Profile Picture */}
                  <div className="relative w-[150px] h-[150px] mx-auto mt-[60px] rounded-full p-1.5 border-[5px] border-[#b8bac0] shadow-[2px_2px_6px_#b8bac0,-2px_-2px_6px_#ffffff] bg-[#e0e5ec] z-10 transition-all duration-350 ease-in-out group-hover:w-24 group-hover:h-24 group-hover:mt-[40px] group-hover:mb-2.5 group-hover:border-[#b8bac0] group-hover:shadow-[inset_2px_2px_6px_#b8bac0,inset_-2px_-2px_6px_#ffffff]">
                    <Image
                      src={a.image}
                      alt={a.name}
                      width={150}
                      height={150}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>

                  {/* Card Text */}
                  <div className="mt-5 font-bold text-xl text-center max-w-[280px] mx-auto text-[#444] transition-opacity duration-150 ease-in-out group-hover:opacity-0">
                    {a.name}
                  </div>
                  <div className="mt-2 font-medium text-md text-center max-w-[280px] mx-auto text-[#888] transition-opacity duration-150 ease-in-out group-hover:opacity-0">
                    <span className="inline-block text-[#8b5cf6] mt-1 px-3 py-1 pb-2 rounded-full  font-semibold"
                        style={{
                          background: "#e0e5ec",
                          boxShadow: "inset 1px 1px 3px #b8bac0, inset -1px -1px 3px #ffffff",
                        }}>
                        {a.category}
                      </span>
                  </div>

                  {/* Overlay Content */}
                  <div className="absolute top-[150px] left-1/2 w-[85%] max-w-[280px] -translate-x-1/2 text-[#333] opacity-0 pointer-events-none transition-opacity duration-150 ease-in-out group-hover:opacity-100 group-hover:pointer-events-auto group-hover:duration-600 group-hover:delay-200 font-semibold text-center text-base z-[15] leading-relaxed">
                    <p className='font-bold text-md text-[#444]'>{a.name}</p>
                    <p className='text-[#6d6d6d] py-2 text-sm'>{a.position}</p>
                    <span className="inline-block text-[#8b5cf6] mt-1 px-3 py-1 pb-2 rounded-full text-sm group-hover:text-purple-500 font-semibold"
                        style={{
                          background: "#e0e5ec",
                          boxShadow: "inset 1px 1px 3px #b8bac0, inset -1px -1px 3px #ffffff",
                        }}>
                        {a.category}
                      </span>
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