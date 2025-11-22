import { useState, useEffect } from 'react'
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  deleteDoc,
  doc,
  getDocs,
  updateDoc
} from 'firebase/firestore'
import { db } from '../firebase'

function StudentView({ onBack, professorId, professorName, professorOffice }) {
  const [inQueue, setInQueue] = useState(false)
  const [studentName, setStudentName] = useState('')
  const [myQueueEntry, setMyQueueEntry] = useState(null)
  const [queueData, setQueueData] = useState([])
  const [loading, setLoading] = useState(true)
  
  const avgWaitTimePerStudent = 7 // Average minutes per student

  // Real-time listener for queue updates
  useEffect(() => {
    if (!professorId) return;

    const queueQuery = query(
      collection(db, 'queue_entries'),
      where('professorId', '==', professorId),
      where('status', '==', 'waiting'),
      orderBy('position', 'asc')
    )

    const unsubscribe = onSnapshot(queueQuery, (snapshot) => {
      const entries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setQueueData(entries)
      setLoading(false)

      // Check if we're in the queue and update our entry with latest data
      if (myQueueEntry) {
        const updatedEntry = entries.find(entry => entry.id === myQueueEntry.id)
        if (!updatedEntry) {
          // We've been removed from the queue
          setInQueue(false)
          setMyQueueEntry(null)
        } else {
          // Update with latest data including position changes
          setMyQueueEntry(updatedEntry)
        }
      }
    }, (error) => {
      console.error("Error fetching queue:", error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [professorId, myQueueEntry?.id]) // Only depend on the ID, not the whole object

  // Calculate position and wait time
  const getMyPosition = () => {
    if (!myQueueEntry) return 0
    return myQueueEntry.position
  }

  const calculateWaitTime = () => {
    const position = getMyPosition()
    const studentsAhead = position - 1
    return studentsAhead * avgWaitTimePerStudent
  }

  const calculateAvgQueueWait = () => {
    if (queueData.length === 0) return 0
    return avgWaitTimePerStudent
  }

  const joinQueue = async () => {
    if (!studentName.trim()) {
      alert('Please enter your name!')
      return
    }

    try {
      // Get the next position number
      const nextPosition = queueData.length + 1

      // Add to Firebase
      const docRef = await addDoc(collection(db, 'queue_entries'), {
        professorId: professorId,
        studentName: studentName.trim(),
        position: nextPosition,
        status: 'waiting',
        joinedAt: new Date().toISOString()
      })

      setMyQueueEntry({
        id: docRef.id,
        professorId: professorId,
        studentName: studentName.trim(),
        position: nextPosition,
        status: 'waiting',
        joinedAt: new Date().toISOString()
      })

      setInQueue(true)
    } catch (error) {
      console.error("Error joining queue:", error)
      alert('Failed to join queue. Please try again.')
    }
  }

  const leaveQueue = async () => {
    if (!myQueueEntry) return

    try {
      const myPosition = myQueueEntry.position;
      
      // Delete from Firebase
      await deleteDoc(doc(db, 'queue_entries', myQueueEntry.id))
      
      // Update positions of students after us
      const studentsAfter = queueData.filter(entry => entry.position > myPosition)
      const updatePromises = studentsAfter.map(student => {
        return updateDoc(doc(db, 'queue_entries', student.id), {
          position: student.position - 1
        });
      });
      
      await Promise.all(updatePromises);
      
      setInQueue(false)
      setMyQueueEntry(null)
      setStudentName('')
    } catch (error) {
      console.error("Error leaving queue:", error)
      alert('Failed to leave queue. Please try again.')
    }
  }

  // JOIN QUEUE VIEW (Before joining)
  if (!inQueue) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 p-4 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}></div>
        
        {/* Subtle USF watermark */}
        <div className="absolute right-[-3%] bottom-[10%] text-[15rem] font-black text-yellow-400/3 select-none pointer-events-none transform rotate-12">
          USF
        </div>
        
        {/* Decorative elements */}
        <div className="absolute left-[5%] top-[15%] w-24 h-24 border-2 border-yellow-400/8 transform rotate-45"></div>
        <div className="absolute right-[8%] top-[25%] opacity-4">
          <div className="text-yellow-400 text-5xl transform -rotate-12">⚡</div>
        </div>
        
        {/* MOBILE RESPONSIVENESS TWEAK: px-4 on mobile */}
        <div className="max-w-2xl mx-auto pt-12 px-4 sm:px-0 relative z-10"> 
          <button 
            onClick={onBack}
            className="text-yellow-300 mb-6 flex items-center hover:text-yellow-100 transition duration-150 font-semibold"
          >
            ← Back to Home
          </button>
          <div className="bg-white rounded-xl shadow-2xl p-8 border-4 border-yellow-400">
            <h1 className="text-3xl font-bold text-emerald-900 mb-2">Join Office Hours</h1>
            <p className="text-gray-700 mb-6 font-semibold">{professorName} - {professorOffice}</p>
            
            <div className="mb-6">
              <label className="block text-emerald-900 font-bold mb-2">
                Your Name:
              </label>
              <input 
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition duration-150"
              />
            </div>
            
            {/* Queue Stats - NEW FEATURE */}
            <div className="bg-emerald-50 border-2 border-emerald-300 p-5 rounded-lg mb-6">
              <h3 className="font-bold text-emerald-900 mb-3 flex items-center">
                <span className="text-2xl mr-2">📊</span>
                Queue Statistics
              </h3>
              {loading ? (
                <p className="text-center text-gray-600">Loading queue data...</p>
              ) : (
                <>
                  {/* MOBILE RESPONSIVENESS TWEAK: stacks on small screens */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> 
                    <div className="bg-white p-3 rounded-lg shadow-sm border-2 border-emerald-200">
                      <p className="text-sm text-gray-700 font-semibold">Students Waiting</p>
                      <p className="text-3xl font-bold text-emerald-700">{queueData.length}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border-2 border-yellow-300">
                      <p className="text-sm text-gray-700 font-semibold">Avg Wait Time Per Person</p>
                      <p className="text-3xl font-bold text-yellow-600">{avgWaitTimePerStudent}<span className="text-lg">m</span></p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t-2 border-emerald-300">
                    <p className="text-sm text-gray-800 font-semibold">
                      ⏱️ <strong>Your estimated total queue wait:</strong> ~{queueData.length * avgWaitTimePerStudent} minutes
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      {queueData.length > 0 ? '1 student currently being helped' : 'No one in queue currently'}
                    </p>
                  </div>
                </>
              )}
            </div>
            
            {/* JOIN BUTTON - ANIMATION TWEAK */}
            <button 
              onClick={joinQueue}
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 rounded-lg transition duration-300 transform hover:scale-[1.01] shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Join Queue ({queueData.length + 1} students after you join)
            </button>
          </div>
        </div>
      </div>
    )
  }

  // IN QUEUE VIEW (After joining)
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 p-4">
      <div className="max-w-2xl mx-auto pt-12 px-4 sm:px-0">
        <button 
          onClick={onBack}
          className="text-yellow-300 mb-6 flex items-center hover:text-yellow-100 transition duration-150 font-semibold"
        >
          ← Back to Home
        </button>
        <div className="bg-white rounded-xl shadow-2xl p-8 border-4 border-yellow-400">
          <h1 className="text-3xl font-bold text-emerald-900 mb-2">{professorName}'s Office Hours</h1>
          <p className="text-gray-700 mb-6 font-semibold">{professorOffice}</p>
          
          {/* POSITION CARD - ANIMATION TWEAK */}
          <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white p-8 rounded-xl mb-6 text-center shadow-lg transition duration-300 hover:shadow-2xl hover:scale-[1.005] border-2 border-yellow-400">
            <p className="text-lg mb-2">You are</p>
            <p className="text-7xl font-bold mb-2">#{getMyPosition()}</p>
            <p className="text-lg">in line</p>
            <p className="mt-4 text-yellow-200 text-xl font-semibold">
              ⏱️ Est. wait: <strong>~{calculateWaitTime()} minutes</strong>
            </p>
          </div>
          
          {/* Queue Stats - NEW FEATURE */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6 border-2 border-gray-300">
            {/* MOBILE RESPONSIVENESS TWEAK: changes flex direction on small screens */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
              <div>
                <p className="text-sm text-gray-700 font-semibold">Total in Queue</p>
                <p className="text-2xl font-bold text-emerald-900">{queueData.length} students</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-700 font-semibold">Avg Wait Per Person</p>
                <p className="text-2xl font-bold text-yellow-600">{avgWaitTimePerStudent} min</p>
              </div>
            </div>
          </div>
          
          {/* LEAVE BUTTON - ANIMATION TWEAK */}
          <button 
            onClick={leaveQueue}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition duration-300 mb-6 shadow-md"
          >
            Leave Queue
          </button>
          
          {/* Current Queue List */}
          <div className="border-t-2 border-gray-300 pt-6">
            <h3 className="text-xl font-bold text-emerald-900 mb-4">
              Current Queue: {queueData.length} {queueData.length === 1 ? 'person' : 'people'}
            </h3>
            <div className="space-y-3">
              {queueData.map((entry, index) => {
                const isMe = entry.id === myQueueEntry?.id
                const isFirst = index === 0
                
                return (
                  <div 
                    key={entry.id} 
                    className={`flex items-center justify-between p-3 rounded-lg transition duration-300 ${
                      isMe 
                        ? 'bg-yellow-100 border-4 border-yellow-500' 
                        : isFirst 
                          ? 'bg-emerald-100 border-2 border-emerald-400'
                          : 'bg-gray-100 border-2 border-gray-300'
                    }`}
                  >
                    <span className={`font-bold ${isMe ? 'text-gray-900' : isFirst ? 'text-emerald-900' : 'text-gray-900'}`}>
                      {entry.position}️⃣ {isMe ? entry.studentName : 'Someone'}
                    </span>
                    <span className={`text-sm font-bold ${
                      isMe 
                        ? 'text-yellow-700' 
                        : isFirst 
                          ? 'text-emerald-700'
                          : 'text-gray-600'
                    }`}>
                      {isMe ? '← You are here' : isFirst ? 'Being helped now' : index === 1 ? 'Next up' : 'Waiting'}
                    </span>
                  </div>
                )
              })}
            </div>
            <p className="text-sm text-gray-600 mt-4 text-center italic">
              Names hidden for privacy - only you can see your name
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentView