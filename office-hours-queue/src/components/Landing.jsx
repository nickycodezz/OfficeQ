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
        }));
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

  // If a role hasn't been selected, show the initial choice screen
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600">
        <header className="text-white text-center pt-12 pb-8 px-4">
          <h1 className="text-6xl font-bold mb-2">OfficeQ</h1>
          <p className="text-xl">Virtual Office Hours Queue</p>
        </header>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 px-4">
          {/* Student Card */}
          <div className="bg-white p-8 rounded-xl shadow-2xl hover:shadow-3xl transition">
            <div className="text-6xl mb-4 text-center">🎓</div>
            <h2 className="text-3xl font-bold mb-3 text-gray-800 text-center">Students</h2>
            <p className="text-gray-600 mb-6 text-center">Join your professor's queue.</p>
            <button 
              onClick={() => setSelectedRole('student')} // Changed to set local state
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition transform hover:scale-105"
            >
              Select Professor
            </button>
          </div>

          {/* Professor Card */}
          <div className="bg-white p-8 rounded-xl shadow-2xl hover:shadow-3xl transition">
            <div className="text-6xl mb-4 text-center">👨‍🏫</div>
            <h2 className="text-3xl font-bold mb-3 text-gray-800 text-center">Professors</h2>
            <p className="text-gray-600 mb-6 text-center">Manage your office hours queue.</p>
            <button 
              onClick={() => setShowLoginModal(true)} // Show login modal
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition transform hover:scale-105"
            >
              Open Dashboard
            </button>
          </div>
        </div>

        <footer className="text-white text-center mt-12 pb-8 px-4">
          <p className="text-sm opacity-75">Built for USF • Skip the line, save time</p>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 p-4">
        <div className="max-w-4xl mx-auto pt-12">
          <button 
            onClick={() => setSelectedRole(null)} 
            className="text-white mb-6 flex items-center hover:underline"
          >
            ← Back to Role Select
          </button>
          
          <h1 className="text-3xl font-bold text-white mb-6">Select Your Professor</h1>
          
          <div className="bg-white p-6 rounded-xl shadow-2xl">
            {loading && <div className="text-center py-8">Loading professors...</div>}
            
            {!loading && professors.length === 0 && (
              <div className="text-center py-8 text-gray-600">No professors are currently available.</div>
            )}

            {!loading && professors.map((prof) => (
              <div key={prof.id} className="flex justify-between items-center p-4 mb-3 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <h3 className="font-semibold text-xl text-gray-800">{prof.name}</h3>
                  <p className="text-sm text-gray-600">Office: {prof.office}</p>
                </div>
                <button
                  // This calls the external handler to switch to StudentView for this professor
                  onClick={() => onSelectProfessor(prof.id, prof.name, prof.office)}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition"
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