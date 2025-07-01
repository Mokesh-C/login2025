'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  ArrowRightLeft,
  Trophy,
  Calendar,
  Presentation,
  CheckCircle,
  MessageCircle,
  LogOut,
  Clock,
} from 'lucide-react';
import type { Easing } from 'framer-motion';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  time: string;
  status: 'success' | 'pending' | 'failed';
}

interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  hasCertificate?: boolean;
  isUpcoming?: boolean;
}

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'about' | 'transactions' | 'events' | 'workshops' | 'papers'>('about');
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setPageLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const studentData = {
    name: "HARISH V",
    loginId: "Login1234",
    email: "24mx208@psgtech.ac.in",
    phone: "1234567890",
    college: "PSG College of Technology (Autonomous), Peelamedu, Coimbatore District 641004",
    profileImage: null
  };

  const transactions: Transaction[] = [
    {
      id: "Login_2k25_050911",
      description: "General registration paid successfully",
      amount: 200,
      date: "Thu JUN 30 2025",
      time: "13:43:47",
      status: 'success'
    }
  ];

  const registeredEvents: Event[] = [
    { id: "1", name: "Code Sprint", date: "Aug 16", time: "9:30 AM - 4:30 PM", hasCertificate: false },
    { id: "2", name: "Witty Minds", date: "Aug 15", time: "9:30 AM - 4:30 PM", hasCertificate: true, isUpcoming: true },
    { id: "3", name: "Quiz", date: "Aug 15", time: "9:30 AM - 12:30 PM", hasCertificate: true, isUpcoming: false }
  ];

  const totalEvents = registeredEvents.length;
  const upcomingEvents = registeredEvents.filter(e => e.isUpcoming).length;

  const renderAboutSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {['Name', 'Login Id', 'Email', 'Phone', 'College'].map((field, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-white/60 mb-1">{field}</label>
              <p className="font-medium text-white/90">
                {studentData[field.toLowerCase().replace(' ', '') as keyof typeof studentData]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTransactionsSection = () => (
    <div className="space-y-6">
      {transactions.map(transaction => (
        <div key={transaction.id} className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-md p-6 shadow-xl">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-white/60">Transaction ID: {transaction.id}</p>
                <p className="font-medium text-green-400">{transaction.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/60">{transaction.date}</p>
              <p className="text-sm text-white/60">{transaction.time}</p>
              <p className="text-xl font-bold text-green-400">Rs. {transaction.amount}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEventsSection = () => (
    <div className="space-y-6">
      {registeredEvents.map(event => (
        <div key={event.id} className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-md p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60 mb-1">{event.date}</p>
              <h3 className="text-lg font-semibold text-white/90 mb-1">{event.name}</h3>
              <p className="text-white/60">{event.time}</p>
            </div>
            {event.hasCertificate && (
              <button className="bg-accent text-white px-4 py-2 rounded-md hover:bg-accent-hover transition-colors">
                Download Certificate
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderWorkshopsSection = () => (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-md p-8 text-center">
        <Calendar className="w-12 h-12 text-white/40 mx-auto mb-4" />
        <p className="text-white/90 mb-4">You haven't registered for any workshops yet!</p>
        <button className="bg-accent text-white px-6 py-2 rounded-md hover:bg-accent-hover transition-colors">
          Register for workshops here →
        </button>
      </div>
    </div>
  );

  const renderPapersSection = () => (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-md p-8 text-center">
        <Presentation className="w-12 h-12 text-white/40 mx-auto mb-4" />
        <p className="text-white/90 mb-4">No paper presentations registered yet.</p>
        <button className="bg-accent text-white px-6 py-2 rounded-md hover:bg-accent-hover transition-colors">
          Submit Paper Presentation
        </button>
      </div>
    </div>
  );

  const sectionVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as Easing }
    },
    exit: {
      opacity: 0,
      x: -50,
      transition: { duration: 0.3, ease: [0.42, 0, 1, 1] as Easing }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={pageLoaded ? { opacity: 1 } : {}} transition={{ duration: 0.5 }} className="min-h-screen bg-[#0d0718] text-white">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent blur-3xl opacity-50" />

      <div className="max-w-7xl mx-auto px-4 pt-12 relative z-10">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-md shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{studentData.name}</h1>
                <p className="text-white/60">PROFILE</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">College ID Uploaded Successfully</span>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* LEFT PANEL */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-md p-6 space-y-6 shadow-xl">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <p className="text-white/80 font-semibold">Total Events: {totalEvents}</p>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-400" />
                <p className="text-white/80 font-semibold">Upcoming: {upcomingEvents}</p>
              </div>
              <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-md shadow-xl">
              {/* TAB BAR */}
              <div className="relative flex gap-2 p-4 border-b border-white/10 bg-white/5 rounded-t-md overflow-x-auto">
                {(['about', 'transactions', 'events', 'workshops', 'papers'] as const).map(tab => {
                    const isActive = activeTab === tab;
                    return (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className="relative px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                        activeTab === tab ? 'text-white' : 'text-white/60 hover:bg-white/10"
                    >
                        {isActive && (
                        <motion.div
                            layoutId="tabIndicator"
                            className="absolute inset-0 bg-accent rounded-md z-[-1]"
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                        )}
                        <span className={isActive ? 'text-white' : 'text-white/60'}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                    </button>
                    );
                })}
            </div>

              {/* TAB CONTENT */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div key={activeTab} variants={sectionVariants} initial="hidden" animate="visible" exit="exit">
                    {activeTab === 'about' && renderAboutSection()}
                    {activeTab === 'transactions' && renderTransactionsSection()}
                    {activeTab === 'events' && renderEventsSection()}
                    {activeTab === 'workshops' && renderWorkshopsSection()}
                    {activeTab === 'papers' && renderPapersSection()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-accent hover:bg-accent-hover text-white rounded-full shadow-lg flex items-center justify-center transition-colors" aria-label="Open chat">
        <MessageCircle className="w-6 h-6" />
      </button>
    </motion.div>
  );
};

export default Profile;
