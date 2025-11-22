import { useState } from 'react'
import Landing from './components/Landing'
import StudentView from './components/StudentView'
import ProfessorView from './components/ProfessorView'

function App() {
  const [view, setView] = useState('landing') // landing, student, professor

  if (view === 'student') {
    return <StudentView onBack={() => setView('landing')} />
  }

  if (view === 'professor') {
    return <ProfessorView onBack={() => setView('landing')} />
  }

  return <Landing onSelectRole={(role) => setView(role)} />
}

export default App