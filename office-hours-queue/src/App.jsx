import React, { useState } from 'react'; // Import React for consistency
import LandingPage from './components/Landing'; // Renamed to match your file structure
import StudentView from './components/StudentView';
import ProfessorView from './components/ProfessorView';

function App() {
  const [view, setView] = useState('landing'); // landing, student, professor
  
  // NEW STATE: Tracks the details of the professor selected by the student
  const [selectedProfDetails, setSelectedProfDetails] = useState(null); // { id, name, office }

  // Function to handle professor selection from the LandingPage
  const handleSelectProfessor = (id, name, office) => {
    setSelectedProfDetails({ id, name, office });
    setView('student'); // Switch the view to the StudentView
  };

  // Function to handle the 'Back to Home' click from any child component
  const handleBack = () => {
    setView('landing');
    setSelectedProfDetails(null); // Clear selection when returning to home
  };

  // --- 1. RENDER STUDENT VIEW ---
  if (view === 'student' && selectedProfDetails) {
    return (
      <StudentView 
        onBack={handleBack} 
        // Pass the necessary professor data as props to StudentView
        professorId={selectedProfDetails.id}
        professorName={selectedProfDetails.name}
        professorOffice={selectedProfDetails.office}
      />
    );
  }

  // --- 2. RENDER PROFESSOR VIEW ---
  if (view === 'professor') {
    // Note: You might want to pass a professor ID here later for security/login
    return <ProfessorView onBack={handleBack} />;
  }

  // --- 3. RENDER LANDING PAGE ---
  return (
    <LandingPage 
      // This prop handles the initial click on the "Professor" card
      onSelectRole={(role) => setView(role)} 
      
      // This NEW prop handles the click on a specific professor's "Join Queue" button
      onSelectProfessor={handleSelectProfessor}
    />
  );
}

export default App;