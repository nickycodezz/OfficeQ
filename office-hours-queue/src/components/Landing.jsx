import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Import the database instance
import ProfessorLoginModal from './ProfessorLoginModal';

// Rename the function to match the file name: LandingPage
function Landing({ onSelectRole, onSelectProfessor }) {
  
  // State to hold the list of professors
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // --- 1. FETCH PROFESSOR DATA (One-Time Read) ---
  useEffect(() => {
    async function fetchProfessors() {
      try {
        const querySnapshot = await getDocs(collection(db, 'professors'));
        const profs = querySnapshot.docs.map(doc => ({
          id: doc.id, // This is the Document ID we need for the queue
          ...doc.data()
        })).filter(prof => prof.isAvailable !== false); // Only show available professors
        setProfessors(profs);
      } catch (error) {
        console.error("Error fetching professors:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfessors();
  }, []); // Empty dependency array ensures it runs only once on mount

  // --- 2. RENDER LOGIC ---
  
  // A local state to control which view is visible (role selection vs. professor list)
  const [selectedRole, setSelectedRole] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Format time
  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // If a role hasn't been selected, show the initial choice screen
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 relative overflow-hidden">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/5 via-transparent to-emerald-400/5 animate-pulse" style={{animationDuration: '4s'}}></div>
        
        {/* Dot pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle, #fbbf24 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>

        {/* USF-themed decorative elements */}
        {/* Large "USF" text watermark - left side */}
        <div className="absolute left-[-5%] top-[20%] text-[20rem] font-black text-yellow-400/5 select-none pointer-events-none transform -rotate-12">
          USF
        </div>
        
        {/* Large "USF" text watermark - right side */}
        <div className="absolute right-[-5%] bottom-[15%] text-[20rem] font-black text-emerald-700/5 select-none pointer-events-none transform rotate-12">
          USF
        </div>
        
        {/* Decorative bull horn patterns (subtle) */}
        <div className="absolute left-[10%] top-[10%] opacity-5">
          <div className="text-yellow-400 text-6xl transform rotate-45">⚡</div>
        </div>
        <div className="absolute right-[15%] top-[25%] opacity-5">
          <div className="text-yellow-400 text-6xl transform -rotate-12">⚡</div>
        </div>
        <div className="absolute left-[12%] bottom-[20%] opacity-5">
          <div className="text-yellow-400 text-6xl transform rotate-12">⚡</div>
        </div>
        <div className="absolute right-[8%] bottom-[30%] opacity-5">
          <div className="text-yellow-400 text-6xl transform -rotate-45">⚡</div>
        </div>
        
        {/* Hexagonal pattern elements (academic theme) */}
        <div className="absolute left-[20%] top-[40%] w-32 h-32 border-2 border-yellow-400/10 transform rotate-45"></div>
        <div className="absolute right-[25%] top-[15%] w-24 h-24 border-2 border-emerald-700/10 transform rotate-12"></div>
        <div className="absolute left-[15%] bottom-[25%] w-28 h-28 border-2 border-yellow-400/10 transform -rotate-12"></div>
        <div className="absolute right-[20%] bottom-[40%] w-36 h-36 border-2 border-emerald-700/10 transform rotate-45"></div>

        {/* Decorative Background Icons with floating animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Top Left */}
          <div className="absolute top-10 left-10 text-6xl opacity-20 animate-bounce" style={{animationDuration: '3s', animationDelay: '0s'}}>📚</div>
          <div className="absolute top-32 left-32 text-4xl opacity-15 animate-pulse" style={{animationDuration: '2s'}}>✏️</div>
          
          {/* Top Right */}
          <div className="absolute top-20 right-20 text-5xl opacity-20 animate-bounce" style={{animationDuration: '3.5s', animationDelay: '1s'}}>🎓</div>
          <div className="absolute top-48 right-48 text-3xl opacity-15 animate-pulse" style={{animationDuration: '2.5s'}}>📝</div>
          
          {/* Bottom Left */}
          <div className="absolute bottom-20 left-16 text-5xl opacity-20 animate-bounce" style={{animationDuration: '4s', animationDelay: '2s'}}>💡</div>
          <div className="absolute bottom-40 left-40 text-4xl opacity-15 animate-pulse" style={{animationDuration: '3s'}}>🖊️</div>
          
          {/* Bottom Right */}
          <div className="absolute bottom-24 right-24 text-6xl opacity-20 animate-bounce" style={{animationDuration: '3.8s', animationDelay: '1.5s'}}>📖</div>
          <div className="absolute bottom-52 right-52 text-3xl opacity-15 animate-pulse" style={{animationDuration: '2.8s'}}>🏫</div>
          
          {/* Middle decorations */}
          <div className="absolute top-1/3 left-1/4 text-4xl opacity-10 animate-pulse" style={{animationDuration: '2.2s'}}>⏰</div>
          <div className="absolute top-2/3 right-1/3 text-4xl opacity-10 animate-pulse" style={{animationDuration: '2.6s'}}>👥</div>
          <div className="absolute top-1/2 left-1/3 text-3xl opacity-10 animate-pulse" style={{animationDuration: '3.2s'}}>✅</div>
          
          {/* Floating circles with animation */}
          <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-yellow-400 rounded-full opacity-5 blur-xl animate-pulse" style={{animationDuration: '3s'}}></div>
          <div className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-emerald-400 rounded-full opacity-5 blur-xl animate-pulse" style={{animationDuration: '4s'}}></div>
          <div className="absolute top-1/2 right-1/2 w-36 h-36 bg-yellow-300 rounded-full opacity-3 blur-2xl animate-pulse" style={{animationDuration: '5s'}}></div>
        </div>

        <header className="text-center pt-12 pb-4 px-4 relative z-10">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <h1 className="text-7xl font-black mb-2 text-yellow-400 tracking-tight drop-shadow-lg" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <span className="inline-block transform hover:scale-105 transition duration-300">Office</span>
                <span className="inline-block bg-yellow-400 text-emerald-900 px-3 py-1 rounded-lg ml-1 shadow-lg transform hover:scale-105 transition duration-300 hover:rotate-3">Q</span>
              </h1>
            </div>
          </div>
          <p className="text-xl text-yellow-100 font-semibold mb-3">Virtual Office Hours Queue</p>
          
          {/* Time and Stats */}
          <div className="flex items-center justify-center gap-6 text-yellow-200/80 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">🕐</span>
              <span>{formatTime()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">👥</span>
              <span>{professors.length} {professors.length === 1 ? 'professor' : 'professors'} available</span>
            </div>
          </div>
        </header>

        {/* Features Section */}
        <div className="max-w-4xl mx-auto px-4 mb-6 relative z-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-yellow-400/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center">
                <span className="text-2xl mb-2">⚡</span>
                <p className="text-yellow-100 text-sm font-semibold">Real-time Updates</p>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl mb-2">📱</span>
                <p className="text-yellow-100 text-sm font-semibold">No App Needed</p>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl mb-2">✅</span>
                <p className="text-yellow-100 text-sm font-semibold">Fair Queue System</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 px-4 relative z-10">
          {/* Student Card */}
          <div className="bg-white p-8 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 border-2 border-yellow-400 transform hover:scale-[1.02] hover:-translate-y-1">
            <div className="text-center mb-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg transform hover:rotate-12 transition duration-300">
                <svg className="w-12 h-12 text-emerald-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-3 text-emerald-900 text-center">Students</h2>
            <p className="text-gray-700 mb-6 text-center">Join your professor's queue.</p>
            <button 
              onClick={() => setSelectedRole('student')} // Changed to set local state
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 rounded-lg transition transform hover:scale-105 shadow-md"
            >
              Select Professor
            </button>
          </div>

          {/* Professor Card */}
          <div className="bg-white p-8 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 border-2 border-emerald-700 transform hover:scale-[1.02] hover:-translate-y-1">
            <div className="text-center mb-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-700 to-emerald-800 rounded-full flex items-center justify-center shadow-lg transform hover:rotate-12 transition duration-300">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-3 text-emerald-900 text-center">Professors</h2>
            <p className="text-gray-700 mb-6 text-center">Manage your office hours queue.</p>
            <button 
              onClick={() => setShowLoginModal(true)} // Show login modal
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 shadow-md"
            >
              Open Dashboard
            </button>
          </div>
        </div>

        {/* Testimonial/Quote Section */}
        <div className="max-w-2xl mx-auto px-4 mt-8 relative z-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-yellow-400/20">
            <div className="text-center">
              <p className="text-yellow-100 italic text-lg mb-2">
                "OfficeQ made my office hours so much more organized. No more chaos!"
              </p>
              <p className="text-yellow-200/70 text-sm">
                — Professor Martinez, Computer Science
              </p>
            </div>
          </div>
        </div>

        <footer className="text-yellow-100 text-center mt-8 pb-8 px-4 relative z-10">
          <p className="text-sm opacity-90">Built for USF • Skip the line, save time</p>
        </footer>

        {/* Professor Login Modal */}
        {showLoginModal && (
          <ProfessorLoginModal
            onLogin={(professorData) => {
              setShowLoginModal(false);
              onSelectRole('professor', professorData);
            }}
            onClose={() => setShowLoginModal(false)}
          />
        )}
      </div>
    );
  }

  // --- RENDER PROFESSOR LIST (if selectedRole is 'student') ---
  if (selectedRole === 'student') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 p-4">
        <div className="max-w-4xl mx-auto pt-12">
          <button 
            onClick={() => setSelectedRole(null)} 
            className="text-yellow-300 mb-6 flex items-center hover:text-yellow-100 transition font-semibold"
          >
            ← Back to Role Select
          </button>
          
          <h1 className="text-3xl font-bold text-yellow-400 mb-6">Select Your Professor</h1>
          
          <div className="bg-white p-6 rounded-xl shadow-2xl border-2 border-yellow-400">
            {loading && <div className="text-center py-8 text-gray-700">Loading professors...</div>}
            
            {!loading && professors.length === 0 && (
              <div className="text-center py-8 text-gray-600">No professors are currently available.</div>
            )}

            {!loading && professors.map((prof) => (
              <div key={prof.id} className="flex justify-between items-center p-4 mb-3 bg-gray-50 rounded-lg border-2 border-emerald-200 hover:border-emerald-400 transition">
                <div>
                  <h3 className="font-semibold text-xl text-emerald-900">{prof.name}</h3>
                  <p className="text-sm text-gray-700">Office: {prof.office}</p>
                </div>
                <button
                  // This calls the external handler to switch to StudentView for this professor
                  onClick={() => onSelectProfessor(prof.id, prof.name, prof.office)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-4 rounded-lg transition shadow-md"
                >
                  Join Queue
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default Landing;