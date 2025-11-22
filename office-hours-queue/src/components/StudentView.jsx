import { useState } from 'react'

function StudentView({ onBack }) {
  const [inQueue, setInQueue] = useState(false)
  const [position, setPosition] = useState(3)
  const [studentName, setStudentName] = useState('')

  const joinQueue = () => {
    if (studentName.trim()) {
      setInQueue(true)
    } else {
      alert('Please enter your name!')
    }
  }

  const leaveQueue = () => {
    setInQueue(false)
    setStudentName('')
  }

  if (!inQueue) {
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Join Office Hours</h1>
            <p className="text-gray-600 mb-6">Dr. Smith - ENG 301 - Room 123</p>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Your Name:
              </label>
              <input 
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-700">
                <strong>Current Queue:</strong> 3 students waiting
              </p>
              <p className="text-sm text-gray-700">
                <strong>Estimated wait:</strong> ~15 minutes
              </p>
            </div>

            <button 
              onClick={joinQueue}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition transform hover:scale-105"
            >
              Join Queue
            </button>
          </div>
        </div>
      </div>
    )
  }

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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dr. Smith's Office Hours</h1>
          <p className="text-gray-600 mb-6">ENG 301 - Room 123</p>

          {/* Position Card */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-8 rounded-xl mb-6 text-center">
            <p className="text-lg mb-2">You are</p>
            <p className="text-7xl font-bold mb-2">#{position}</p>
            <p className="text-lg">in line</p>
            <p className="mt-4 text-blue-100">Estimated wait: ~{position * 5} minutes</p>
          </div>

          <button 
            onClick={leaveQueue}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition mb-6"
          >
            Leave Queue
          </button>

          {/* Current Queue */}
          <div className="border-t pt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Current Queue:</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-semibold">1️⃣ John D.</span>
                <span className="text-sm text-green-600">Being helped now</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-semibold">2️⃣ Sarah M.</span>
                <span className="text-sm text-gray-500">Next up</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-2 border-blue-500">
                <span className="font-semibold">3️⃣ {studentName}</span>
                <span className="text-sm text-blue-600">You</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-semibold">4️⃣ Mike L.</span>
                <span className="text-sm text-gray-500">Waiting</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentView