import React, { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  doc, 
  serverTimestamp, 
  orderBy 
} from 'firebase/firestore';

import { db } from '../firebase';

// Assume you pass the professor's ID and name from the LandingPage
function StudentView({ onBack, professorId, professorName, professorOffice }) {
  
  // State to track the queue entry ID for monitoring/deletion
  const [queueDocId, setQueueDocId] = useState(null); 
  
  // State for the student's current position and overall queue length
  const [position, setPosition] = useState(null);
  const [queueLength, setQueueLength] = useState(0); 

  // Form states
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState(''); 
  
  const [isJoining, setIsJoining] = useState(false);
  const [loadingQueue, setLoadingQueue] = useState(true);
  
  // --- 1. FIREBASE WRITE: JOIN QUEUE ---
  const joinQueue = async (e) => {
    e.preventDefault(); // Prevent form submission refresh
    
    if (!studentName.trim() || !studentEmail.trim()) {
      alert('Please enter your name and email!');
      return;
    }
    
    setIsJoining(true);
    
    try {
      // Find the last position or let a Cloud Function handle this
      // For simplicity here, we rely on the ProfessorView logic to show order
      const newDocRef = await addDoc(collection(db, 'queue_entries'), {
        professorId: professorId, // Use prop
        studentName: studentName.trim(),
        studentEmail: studentEmail.trim(), // Best to save email for tracking
        position: 999, // Placeholder position
        status: 'waiting',
        joinedAt: serverTimestamp(),
        estimatedWaitMinutes: 10 // Placeholder
      });
      
      // Store the new document ID to monitor its position later
      setQueueDocId(newDocRef.id); 
      
    } catch (error) {
      console.error("Error joining queue:", error);
      alert('Failed to join the queue. Check console for details.');
    } finally {
      setIsJoining(false);
    }
  };

  // --- 2. FIREBASE DELETE: LEAVE QUEUE ---
  const leaveQueue = async () => {
    if (!queueDocId) return;

    try {
      const docRef = doc(db, 'queue_entries', queueDocId);
      await deleteDoc(docRef);
      
      // Reset local state after successful deletion
      setQueueDocId(null);
      setStudentName('');
      setStudentEmail('');
      setPosition(null);
      setQueueLength(0);
      
      alert('You have successfully left the queue.');

    } catch (error) {
      console.error("Error leaving queue:", error);
    }
  };


  // --- 3. FIREBASE REAL-TIME READ: MONITOR QUEUE STATUS ---
  useEffect(() => {
    if (!professorId) return;

    // Query 1: Get the full list of waiting students for estimated wait time
    const fullQueueQuery = query(
        collection(db, 'queue_entries'),
        where('professorId', '==', professorId),
        where('status', '==', 'waiting'),
        orderBy('joinedAt', 'asc') // Use joinedAt as reliable order field
    );
    
    const unsubscribeQueue = onSnapshot(fullQueueQuery, (snapshot) => {
      const currentQueue = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setQueueLength(currentQueue.length); // Update total queue length
      
      // Find the student's current position based on the doc ID
      const myIndex = currentQueue.findIndex(entry => entry.id === queueDocId);
      
      if (myIndex !== -1) {
        // Position is index + 1
        setPosition(myIndex + 1);
      } else if (queueDocId) {
        // If the doc ID is set but not found in the snapshot, the professor must have removed/called them.
        // We can assume they were just called and reset the state.
        setQueueDocId(null); 
        setPosition(null);
        alert('It looks like your turn has arrived! Please head to the office.');
      }
      
      setLoadingQueue(false);
    }, (error) => {
        console.error("Error monitoring queue:", error);
        setLoadingQueue(false);
    });

    // Cleanup function
    return () => unsubscribeQueue();

  // Dependency array includes queueDocId so the monitoring starts/restarts when the student joins/leaves
  }, [professorId, queueDocId]); 


  // --- 4. RENDER LOGIC ---

  // Renders the Join Form if queueDocId is null (meaning not in queue)
  if (!queueDocId) { 
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600 p-4">
        <div className="max-w-2xl mx-auto pt-12">
          <button 
            onClick={onBack}
            className="text-white mb-6 flex items-center hover:underline"
          >
            ← Back to Home
          </button>

          <form onSubmit={joinQueue} className="bg-white rounded-xl shadow-2xl p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Join Office Hours</h1>
            <p className="text-gray-600 mb-6">{professorName} - {professorOffice}</p> {/* Use props */}

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Your Name:</label>
              <input 
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Your Email:</label>
              <input 
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="Enter your university email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>


            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              {loadingQueue ? (
                <p className="text-sm text-gray-700">Loading queue status...</p>
              ) : (
                <>
                  <p className="text-sm text-gray-700">
                    <strong>Current Queue:</strong> {queueLength} students waiting
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Estimated wait:</strong> ~{queueLength * 5} minutes
                  </p>
                </>
              )}
            </div>

            <button 
              type="submit"
              disabled={isJoining || !professorId}
              className={`w-full font-semibold py-3 rounded-lg transition transform hover:scale-105 ${
                isJoining 
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isJoining ? 'Joining...' : 'Join Queue'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Renders the Status View if queueDocId is set (meaning in queue)
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600 p-4">
      <div className="max-w-2xl mx-auto pt-12">
        <button 
          onClick={onBack}
          className="text-white mb-6 flex items-center hover:underline"
        >
          ← Back to Home
        </button>

        <div className="bg-white rounded-xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{professorName}'s Office Hours</h1>
          <p className="text-gray-600 mb-6">{professorOffice}</p>

          {/* Position Card */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-8 rounded-xl mb-6 text-center">
            {position !== null && (
                <>
                    <p className="text-lg mb-2">You are</p>
                    <p className="text-7xl font-bold mb-2">#{position}</p>
                    <p className="text-lg">in line</p>
                    <p className="mt-4 text-blue-100">Estimated wait: ~{position * 5} minutes</p>
                </>
            )}
            {position === 1 && (
                <p className="text-2xl font-semibold mt-4">You are next! Get ready.</p>
            )}
          </div>

          <button 
            onClick={leaveQueue}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition mb-6"
          >
            Leave Queue
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentView;