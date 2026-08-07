import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Predictions from './pages/Predictions';
import ModelInsights from './pages/ModelInsights';
import Segments from './pages/Segments';

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-950 text-white">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/insights" element={<ModelInsights />} />
            <Route path="/segments" element={<Segments />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
