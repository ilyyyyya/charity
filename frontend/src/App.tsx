import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Navbar';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <AppRoutes />
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;