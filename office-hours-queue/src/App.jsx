import React, { useState } from 'react'; // Import React for consistency
import LandingPage from './components/Landing'; // Renamed to match your file structure
import StudentView from './components/StudentView';
import ProfessorView from './components/ProfessorView';

function App() {
  const [view, setView] = useState('landing'); // landing, student, professor
  
  // NEW STATE: Tracks the details of the professor selected by the student
  const [selectedProfDetails, setSelectedProfDetails] = useState(null); // { id, name, office }
  
  // NEW STATE: Tracks the logged-in professor's data
  const [loggedInProfessor, setLoggedInProfessor] = useState(null); // { id, name, email, office }

  // Function to handle professor selection from the LandingPage
  const handleSelectProfessor = (id, name, office) => {
    setSelectedProfDetails({ id, name, office });
    setView('student'); // Switch the view to the StudentView
  };

  // Function to handle the 'Back to Home' click from any child component
  const handleBack = () => {
    setView('landing');
    setSelectedProfDetails(null); // Clear selection when returning to home
    setLoggedInProfessor(null); // Clear logged-in professor when returning to home
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
  if (view === 'professor' && loggedInProfessor) {
    return <ProfessorView onBack={handleBack} professorData={loggedInProfessor} />;
  }

  // --- 3. RENDER LANDING PAGE ---
  return (
    <LandingPage 
      // This prop handles the professor login and role selection
      onSelectRole={(role, professorData) => {
        setView(role);
        if (role === 'professor' && professorData) {
          setLoggedInProfessor(professorData);
        }
      }} 
      
      // This NEW prop handles the click on a specific professor's "Join Queue" button
      onSelectProfessor={handleSelectProfessor}
    />
  );
}

export default App;