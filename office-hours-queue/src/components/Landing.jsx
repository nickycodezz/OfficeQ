function Landing({ onSelectRole }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600">
      
      {/* Header */}
      <header className="text-white text-center pt-12 pb-8 px-4">
        <h1 className="text-6xl font-bold mb-2">OfficeQ</h1>
        <p className="text-xl">Virtual Office Hours Queue</p>
      </header>

      {/* Two Cards */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 px-4">
        
        {/* Student Card */}
        <div className="bg-white p-8 rounded-xl shadow-2xl hover:shadow-3xl transition">
          <div className="text-6xl mb-4 text-center">🎓</div>
          <h2 className="text-3xl font-bold mb-3 text-gray-800 text-center">Students</h2>
          <p className="text-gray-600 mb-6 text-center">
            Join your professor's queue and get notified when it's your turn
          </p>
          <button 
            onClick={() => onSelectRole('student')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition transform hover:scale-105"
          >
            Join Queue
          </button>
        </div>

        {/* Professor Card */}
        <div className="bg-white p-8 rounded-xl shadow-2xl hover:shadow-3xl transition">
          <div className="text-6xl mb-4 text-center">👨‍🏫</div>
          <h2 className="text-3xl font-bold mb-3 text-gray-800 text-center">Professors</h2>
          <p className="text-gray-600 mb-6 text-center">
            Manage your office hours queue and call students efficiently
          </p>
          <button 
            onClick={() => onSelectRole('professor')}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition transform hover:scale-105"
          >
            Open Dashboard
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-white text-center mt-12 pb-8 px-4">
        <p className="text-sm opacity-75">Built for USF • Skip the line, save time</p>
      </footer>
    </div>
  )
}

export default Landing