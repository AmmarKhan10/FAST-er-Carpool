import React, { useState } from 'react';
import { auth, db } from '../firebase-config';
// Fix: Removed unused `AuthErrorCodes` import as it's not needed and was causing an error.
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !phone || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Try to sign in first
      await signInWithEmailAndPassword(auth, email, password);
    } catch (signInError: any) {
      // If sign in fails because user not found, create a new account
      // Fix: `AuthErrorCodes.INVALID_CREDENTIAL` does not exist. Use the string literal 'auth/invalid-credential' which covers user-not-found and wrong-password to prevent account enumeration.
      if (signInError.code === 'auth/invalid-credential') {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          const name = email.split('@')[0].replace(/\./g, ' ').replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
          
          // Create a user profile document in Firestore
          await setDoc(doc(db, "users", user.uid), {
            name: name,
            email: user.email,
            phoneNumber: phone
          });

        } catch (signUpError: any) {
          setError(signUpError.message);
        }
      } else {
         setError(signInError.message);
      }
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">FAST Carpool Connect</h1>
            <p className="text-gray-500 mt-2">Login or Sign Up to continue.</p>
        </div>
        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="you@fast.com" required
            />
          </div>
           <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="123-456-7890" required
            />
          </div>
          <div>
            <label htmlFor="password"className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••" required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {loading ? 'Processing...' : 'Login / Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;