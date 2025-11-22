// src/TestFirebase.js
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

function TestFirebase() {
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfessors() {
      try {
        const querySnapshot = await getDocs(collection(db, 'professors'));
        const profs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProfessors(profs);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching professors:', error);
        setLoading(false);
      }
    }
    
    fetchProfessors();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Firebase Connection Test</h1>
      {professors.length === 0 ? (
        <p>No professors found. Did you add them in Firestore?</p>
      ) : (
        professors.map(prof => (
          <div key={prof.id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ccc' }}>
            <strong>{prof.name}</strong> - {prof.office}
            <br />
            <small>ID: {prof.id}</small>
          </div>
        ))
      )}
    </div>
  );
}

export default TestFirebase;