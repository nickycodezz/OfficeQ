import { useState } from 'react'

function ProfessorView({ onBack }) {
  const [queue, setQueue] = useState([
    { id: 1, name: 'John Doe', joinedAt: '8 minutes ago' },
    { id: 2, name: 'Sarah Miller', joinedAt: '5 minutes ago' },
    { id: 3, name: 'Alex Johnson', joinedAt: '3 minutes ago' },
    { id: 4, name: 'Mike Lee', joinedAt: '1 minute ago' },
  ])
  const [status, setStatus] = useState('available') // available, busy, offline

  const callNextStudent = () => {
    if (queue.length > 0) {
      const nextStudent = queue[0]
      alert(`Calling ${nextStudent.name} - They have been notified!`)
      setQueue(queue.slice(1))
    }
  }

  const toggleStatus = () => {
    setStatus(status === 'available' ? 'busy' : 'available')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600 p-4">
      <div className="max-w-3xl mx-auto pt-12">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={onBack}
            className="text-white flex items-center hover:underline"
          >
            ← Back to Home
          </button>
          <button className="text-white hover:underline">⚙️ Settings</button>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Dr. Smith's Dashboard</h1>
              <p className="text-gray-600">ENG 301 - Office Hours</p>
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
              <h2 className="text-3xl font-bold mb-1">#{1} {queue[0].name}</h2>
              <p className="text-sm opacity-90 mb-4">Joined {queue[0].joinedAt}</p>
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
                {queue.slice(1).map((student, index) => (
                  <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="font-semibold">#{index + 2} {student.name}</p>
                      <p className="text-sm text-gray-500">Joined {student.joinedAt}</p>
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
            <button className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition">
              End Office Hours
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfessorView