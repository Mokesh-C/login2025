import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Events - Login 2025",
    description: "Explore our events",
};

export default function EventLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen">
            {children}
        </div>
    );
}
