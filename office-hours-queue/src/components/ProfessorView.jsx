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
        // Delete the first student from the queue
        const studentDocRef = doc(db, 'queue_entries', nextStudent.id);
        await deleteDoc(studentDocRef);
        
        // Update positions for all remaining students
        const studentsToUpdate = queue.slice(1); // Everyone after the first student
        const updatePromises = studentsToUpdate.map((student, index) => {
          const newPosition = index + 1; // New positions start at 1
          return updateDoc(doc(db, 'queue_entries', student.id), {
            position: newPosition
          });
        });
        
        await Promise.all(updatePromises);
        
        alert(`Calling ${nextStudent.studentName} - They have been removed from the queue!`);
        
      } catch (error) {
        console.error("Error removing student:", error);
        alert('Failed to call next student. Please try again.');
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
      console.log('Deleting professor document and clearing queue...');
      
      // Delete all queue entries for this professor
      const queueEntries = queue;
      const deleteQueuePromises = queueEntries.map(entry => 
        deleteDoc(doc(db, 'queue_entries', entry.id))
      );
      await Promise.all(deleteQueuePromises);
      
      // Delete the professor document
      const professorDocRef = doc(db, 'professors', PROFESSOR_ID);
      await deleteDoc(professorDocRef);
      
      console.log('Professor and queue deleted');
      alert('Office hours ended. All students have been removed from the queue.');
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 p-4">
      <div className="max-w-3xl mx-auto pt-12">
        {/* ... (Unchanged navigation and header JSX) ... */}
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-2xl p-8 border-4 border-yellow-400">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-emerald-900">{professorData?.name}'s Dashboard</h1>
              <p className="text-gray-700 font-semibold">Office: {professorData?.office || 'Not specified'}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-3 h-3 rounded-full ${status === 'available' ? 'bg-emerald-500' : 'bg-yellow-500'}`}></span>
                <span className="font-bold capitalize text-gray-900">{status}</span>
              </div>
              <p className="text-sm text-gray-700 font-semibold">Queue: {queue.length} students</p>
            </div>
          </div>

          {/* Next Student Card */}
          {queue.length > 0 ? (
            <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white p-6 rounded-xl mb-6 shadow-lg border-2 border-yellow-400">
              <p className="text-sm mb-2 opacity-90">Next Student:</p>
              {/* Note: Firestore studentName field is used here */}
              <h2 className="text-3xl font-bold mb-1">#{queue[0].position} {queue[0].studentName}</h2>
              <p className="text-sm opacity-90 mb-4">Joined {formatTimeAgo(queue[0].joinedAt)}</p>
              <button 
                onClick={callNextStudent}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 rounded-lg transition shadow-md"
              >
                Call Next Student
              </button>
            </div>
          ) : (
            <div className="bg-gray-100 p-8 rounded-xl text-center mb-6 border-2 border-gray-300">
              <p className="text-gray-600 text-lg font-semibold">No students in queue</p>
              <p className="text-gray-500 text-sm mt-2">Students will appear here when they join</p>
            </div>
          )}

          {/* Waiting List */}
          {queue.length > 1 && (
            <div className="mb-6">
              <h3 className="text-xl font-bold text-emerald-900 mb-4">Waiting:</h3>
              <div className="space-y-3">
                {queue.slice(1).map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-300 hover:border-emerald-400 transition">
                    <div>
                      {/* Note: Firestore studentName and position fields are used here */}
                      <p className="font-bold text-gray-900">#{student.position} {student.studentName}</p>
                      <p className="text-sm text-gray-600">Joined {formatTimeAgo(student.joinedAt)}</p>
                    </div>
                    <button className="text-gray-600 hover:text-gray-800 text-sm font-bold">
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
              className={`flex-1 font-bold py-3 rounded-lg transition shadow-md ${
                status === 'available' 
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {status === 'available' ? 'Mark as Busy' : 'Mark as Available'}
            </button>
            <button 
              onClick={endOfficeHours}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition shadow-md"
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