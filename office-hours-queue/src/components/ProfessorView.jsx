import React, { useState, useEffect } from 'react';

// Firebase imports needed for the query:
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  // Add doc, updateDoc, and deleteDoc for status and callNextStudent logic (Future Steps)
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

// Import the database instance you exported:
import { db } from '../firebase';

function ProfessorView({ onBack, professorData }) {
  // State for real queue data and loading status
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('available'); // available, busy, offline
  
  // Use the professorData passed from App.jsx
  const PROFESSOR_ID = professorData?.id;

  // --- 1. FIREBASE REAL-TIME LISTENER (useEffect) ---
  useEffect(() => {
    if (!PROFESSOR_ID) {
      console.error('No professor ID provided');
      setLoading(false);
      return;
    }
    
    // 1. Construct the Query
    const queueQuery = query(
      collection(db, 'queue_entries'),
      where('professorId', '==', PROFESSOR_ID), // Filter by this professor's ID
      where('status', '==', 'waiting'),
      orderBy('position', 'asc')
    );
    
    // 2. Set up the Real-Time Listener (onSnapshot)
    const unsubscribe = onSnapshot(queueQuery, (snapshot) => {
      const queueEntries = snapshot.docs.map(doc => ({
        id: doc.id,
        // The ...doc.data() includes studentName, joinedAt, position, etc.
        ...doc.data()
      }));
      
      setQueue(queueEntries);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching queue:", error);
      setLoading(false);
    });

    // 3. Clean up the listener when the component is removed
    return () => unsubscribe();
    
  // Add PROFESSOR_ID to dependency array
  }, [PROFESSOR_ID]); 

  // --- 2. ACTION FUNCTIONS (Placeholder for Firebase Writes) ---

  const callNextStudent = async () => {
    if (queue.length > 0) {
      const nextStudent = queue[0];
      
      try {
        // Find the document in the 'queue_entries' collection
        const studentDocRef = doc(db, 'queue_entries', nextStudent.id);
        
        // FUTURE: Instead of deleting, we typically UPDATE the status to 'called' or 'done'
        await deleteDoc(studentDocRef);
        
        // This alert is just for confirmation
        alert(`Calling ${nextStudent.studentName} - They have been removed from the queue!`);
        
        // Note: setQueue(queue.slice(1)) is NO LONGER NEEDED. 
        // Firestore update handles the state change automatically!
        
      } catch (error) {
        console.error("Error removing student:", error);
      }
    }
  };

  const toggleStatus = async () => {
    const newStatus = status === 'available' ? 'busy' : 'available';
    setStatus(newStatus);
  };
  
  const endOfficeHours = async () => {
    console.log('endOfficeHours called, PROFESSOR_ID:', PROFESSOR_ID);
    
    if (!PROFESSOR_ID) {
      console.error('No professor ID available');
      alert('Error: No professor ID found. Please log in again.');
      return;
    }
    
    try {
      console.log('Updating professor document...');
      const professorDocRef = doc(db, 'professors', PROFESSOR_ID);
      await updateDoc(professorDocRef, { isAvailable: false });
      
      console.log('Professor marked as unavailable');
      alert('Office hours ended. You will no longer appear in the student list.');
      onBack(); // Return to landing page
    } catch (error) {
      console.error('Error ending office hours:', error);
      alert('Failed to end office hours. Please try again.');
    }
  };
  
  // --- 3. RENDER LOGIC ---

  if (loading) {
    return <div className="text-center p-20 text-xl">Loading Queue...</div>;
  }

  // Helper function to show time since joined (requires proper date object)
  // For now, we'll display the 'joinedAt' field from Firestore directly
  const formatTimeAgo = (timestamp) => {
    // You would implement real date formatting here, but for now:
    return timestamp ? 'A moment ago' : 'N/A';
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600 p-4">
      <div className="max-w-3xl mx-auto pt-12">
        {/* ... (Unchanged navigation and header JSX) ... */}
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{professorData?.name}'s Dashboard</h1>
              <p className="text-gray-600">Office: {professorData?.office || 'Not specified'}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-3 h-3 rounded-full ${status === 'available' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                <span className="font-semibold capitalize">{status}</span>
              </div>
              <p className="text-sm text-gray-600">Queue: {queue.length} students</p>
            </div>
          </div>

          {/* Next Student Card */}
          {queue.length > 0 ? (
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl mb-6">
              <p className="text-sm mb-2 opacity-90">Next Student:</p>
              {/* Note: Firestore studentName field is used here */}
              <h2 className="text-3xl font-bold mb-1">#{queue[0].position} {queue[0].studentName}</h2>
              <p className="text-sm opacity-90 mb-4">Joined {formatTimeAgo(queue[0].joinedAt)}</p>
              <button 
                onClick={callNextStudent}
                className="w-full bg-white text-green-600 font-semibold py-3 rounded-lg hover:bg-gray-100 transition"
              >
                Call Next Student
              </button>
            </div>
          ) : (
            <div className="bg-gray-100 p-8 rounded-xl text-center mb-6">
              <p className="text-gray-500 text-lg">No students in queue</p>
              <p className="text-gray-400 text-sm mt-2">Students will appear here when they join</p>
            </div>
          )}

          {/* Waiting List */}
          {queue.length > 1 && (
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Waiting:</h3>
              <div className="space-y-3">
                {queue.slice(1).map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      {/* Note: Firestore studentName and position fields are used here */}
                      <p className="font-semibold">#{student.position} {student.studentName}</p>
                      <p className="text-sm text-gray-500">Joined {formatTimeAgo(student.joinedAt)}</p>
                    </div>
                    <button className="text-red-500 hover:text-red-600 text-sm">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button 
              onClick={toggleStatus}
              className={`flex-1 font-semibold py-3 rounded-lg transition ${
                status === 'available' 
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {status === 'available' ? 'Mark as Busy' : 'Mark as Available'}
            </button>
            <button 
              onClick={endOfficeHours}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition"
            >
              End Office Hours
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfessorView;