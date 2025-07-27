"use client";
import fs from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { useParams } from "next/navigation";
import EventDetailsContent from "./EventDetailsContent";
import useEvents from "@/hooks/useEvents";
import { PageLoader } from "@/components/LoadingSpinner";

// /* ------------------------------------------------------------------
//  * Helper: load one event by slug
//  * -----------------------------------------------------------------*/
// async function getEvent(slug: string) {
//     const filePath = path.join(process.cwd(), "data", "events.json");
//     const events = JSON.parse(await fs.readFile(filePath, "utf8"));

//     return events.find(
//         (e: any) => e.title.toLowerCase().replace(/\s+/g, "") === slug
//     );
// }

// /* ------------------------------------------------------------------
//  * 1.  generateStaticParams  (for SSG)
//  * -----------------------------------------------------------------*/
// export async function generateStaticParams() {
//     const filePath = path.join(process.cwd(), "data", "events.json");
//     const events = JSON.parse(await fs.readFile(filePath, "utf8"));

//     return events.map((e: any) => ({
//         slug: e.title.toLowerCase().replace(/\s+/g, ""),
//     }));
// }

// /* ------------------------------------------------------------------
//  * 2.  generateMetadata
//  * -----------------------------------------------------------------*/
type Props = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//     const { slug } = await params;
//     const event = await getEvent(slug);
//     if (!event) return { title: "Event not found" };

//     return {
//         title: `${event.title} | LOGIN 2025`,
//         description: event.tagline ?? "Explore this event at LOGIN 2025",
//     };
// }

/* ------------------------------------------------------------------
 * 3.  Page component
 * -----------------------------------------------------------------*/
export default function EventDetailsPage() {
    const params = useParams();
    const slug = params.slug;
    const { events, loading } = useEvents();

    if (loading) return <div><PageLoader text="Loading event..." /></div>;
    const event = events.find((e) => e.id === Number(slug));
    if (!event) notFound();

    return <EventDetailsContent event={event} />;
}
