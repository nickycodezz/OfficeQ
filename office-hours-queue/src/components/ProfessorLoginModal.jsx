import React, { useState } from 'react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function ProfessorLoginModal({ onLogin, onClose }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [office, setOffice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim() || !email.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      // Check if professor already exists by email
      const q = query(collection(db, 'professors'), where('email', '==', email));
      const querySnapshot = await getDocs(q);

      let professorId;
      let professorData;

      if (!querySnapshot.empty) {
        // Professor exists, use existing data
        const doc = querySnapshot.docs[0];
        professorId = doc.id;
        professorData = { id: professorId, ...doc.data() };
      } else {
        // New professor, create a new document
        const docRef = await addDoc(collection(db, 'professors'), {
          name: name.trim(),
          email: email.trim(),
          office: office.trim() || 'Not specified',
          isAvailable: true,
          createdAt: new Date().toISOString()
        });
        professorId = docRef.id;
        professorData = {
          id: professorId,
          name: name.trim(),
          email: email.trim(),
          office: office.trim() || 'Not specified'
        };
      }

      // Call the onLogin callback with professor data
      onLogin(professorData);
    } catch (err) {
      console.error('Error logging in:', err);
      setError('Failed to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 border-4 border-yellow-400">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-emerald-900">Professor Login</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-emerald-900 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-emerald-900 font-bold mb-2">
              Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              placeholder="Enter your name"
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label className="block text-emerald-900 font-bold mb-2">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label className="block text-emerald-900 font-bold mb-2">
              Office Location (Optional)
            </label>
            <input
              type="text"
              value={office}
              onChange={(e) => setOffice(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              placeholder="e.g., MSC 3106"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border-2 border-red-400 text-red-800 rounded-lg font-semibold">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-3 rounded-lg transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-lg transition disabled:bg-gray-400 shadow-md"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfessorLoginModal;
