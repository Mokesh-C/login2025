import React from 'react';
export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {/* <h1>Header</h1> */}
            {children}
        </>
    );
}
