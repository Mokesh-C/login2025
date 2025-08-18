"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Pacifico } from "next/font/google";
// import events from "@/data/events.json" assert { type: "json" };
import { useRouter } from "next/navigation";
import useEvents from "@/hooks/useEvents";
import { PageLoader } from "@/components/LoadingSpinner";
import Link from "next/link";
// import { Play, Pause } from 'lucide-react'

// Google font via next/font
const pacifico = Pacifico({ subsets: ["latin"], weight: "400" });

export default function EventsSlider() {
    const router = useRouter();
    const { events, loading } = useEvents();
    const [active, setActive] = useState(0);
    const [rotateDeg, setRotateDeg] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true); // autoplay starts ON
    //   const togglePlay = () => setIsPlaying((p) => !p)

    const step = 360 / events.length;
    const next = () => {
        setActive((i) => (i + 1) % events.length);
        setRotateDeg((deg) => deg + step);
        setIsPlaying(false);
    };

    const prev = () => {
        setActive((i) => (i - 1 + events.length) % events.length);
        setRotateDeg((deg) => deg - step);
        setIsPlaying(false);
    };
    const translateY = "-410px";

    useEffect(() => {
        if (!isPlaying) return;
        const timer = setInterval(() => {
            setActive((i) => (i + 1) % events.length);
            setRotateDeg((deg) => deg + step);
        }, 3000);

        return () => clearInterval(timer);
    }, [isPlaying, step]); //[isPlaying, step]
    

    if (loading) return <div><PageLoader text="Loading events..." /></div>;
    return (
        <main className="bg-gradient-to-br from-accent-first via-accent-second to-accent-third font-mono text-white">
            {/* Orange half overlay */}
            {/* <button onClick={()=> router.push('/')} >&lt; Back</button> */}
            <div className="relative overflow-hidden min-h-[calc(100vh-5rem)]">
                <div className="absolute inset-y-0 left-0 w-1/2 bg-blue-300/5 pointer-events-none" />
        
                {/* Giant cursive heading */}
                <div className="relative w-full max-w-7xl mx-auto py-4 flex flex-col md:flex-row gap-10 min-h-[400px] items-center justify-center">
                    {/* Active Image */}
                    <div className="w-[80%] md:w-1/2 flex items-center justify-center ">
                        <div
                            key={active}
                            className="w-3/4 flex items-center justify-center bg-blue-300/10 rounded-md animate-fade-in"
                        >
                            <Image
                                src={events[active]?.images?.[0]?.url || "https://images.unsplash.com/photo-1739184523594-564cb9b61126?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
                                alt={events[active]?.name || "Event image"}
                                width={450}
                                height={450}
                                className="object-contain m-2  max-w-full h-auto rounded-md transition-all duration-500"
                                priority
                            />
                        </div>
                    </div>

                    {/* Event Description */}
                    <div className="w-full md:w-1/2 flex flex-col items-center text-center md:text-left px-4">
                        {events.map((e, i) => {
                            const slug = e.name.toLowerCase().replace(/\s+/g, "");
                            return (
                                <article
                                    key={e.name}
                                    className={
                                        i === active
                                            ? "block animate-fade-in"
                                            : "hidden"
                                    }
                                >
                                    <h2 className="text-2xl md:text-5xl font-bold text-gradient">
                                        {e.name}
                                    </h2>
                                    <p className="mt-2 text-base md:text-lg leading-relaxed">
                                        {e.tagline}
                                    </p>
                                    <Link
                                        href={`/events/${e.id}`}
                                        className="mt-4 bg-gradient-to-r from-violet-800 to-purple-600 text-white font-bold py-2 px-5 md:px-6 rounded-md hover:shadow-purple-500/25 z-30"
                                    >
                                        Explore More
                                    </Link>
                                </article>
                            );
                        })}
                    </div>
                </div>

                <div className="relative w-full max-w-7xl mx-auto py-4 flex flex-row gap-10 items-center justify-center">
                    <div className="w-full md:w-1/2 flex justify-center items-center ">
                        <button
                            onClick={prev}
                            className=" -translate-y-1/2 text-[50px] md:text-[100px] font-bold opacity-30 transition-opacity hover:opacity-100 z-30"
                        >
                            &lt;
                        </button>
                    </div>
                    <div className="w-full md:w-1/2 flex text-center md:text-left justify-center ">
                        <button
                            onClick={next}
                            className="-translate-y-1/2 text-[50px] md:text-[100px] font-bold opacity-30 transition-opacity hover:opacity-100 z-30"
                        >
                            &gt;
                        </button>
                    </div>
                </div>

                <div className="relative w-full"></div>

                {/* Rotating image wheel */}
                <div
                    className="absolute left-1/2 bottom-[-28%] md:bottom-[-50%] aspect-square w-[800px] md:w-[1200px] -translate-x-1/2 translate-y-1/2 rounded-full  outline-3 outline-dashed outline-white/30 transition-transform duration-500 outline-offset-[-100px] z-10 pointer-events-none"
                    style={{
                        transform: `translate(-50%,50%) rotate(${rotateDeg}deg)`,
                    }}
                >
                    {events.map((e, i) => (
                        <div
                            key={e.id}
                            className="absolute inset-0 flex items-start justify-center "
                            style={{ transform: `rotate(${-i * step}deg)` }}
                        >
                            <Image
                                src={e.logoUrl || ""}
                                alt={e.name}
                                width={150}
                                height={150}
                                sizes="(max-width: 639px) 120px, 120px"
                                className={`rounded-full border-8 md:border-[10px] transition-transform duration-300 ease-in-out w-[110px] h-[110px] sm:w-[120px] sm:h-[120px] md:w-[150px] md:h-[150px] ${
                                    i === active
                                        ? e.name === "STAR OF LOGIN"
                                            ? "border-cyan-300 scale-[1.2]"
                                            : "border-violet-500 scale-[1.2]"
                                        : "border-white/10"
                                }`}
                                priority={i === 0}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Fade‑in keyframes */}
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(40px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fadeIn 0.5s ease forwards;
                }
            `}</style>
        </main>
    );
}
