import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import UploadPage from './pages/UploadPage';
import SearchPage from './pages/SearchPage';
import JobsPage from './pages/JobsPage';
import CandidatePage from './pages/CandidatePage';

const App = () => {
    return (
        <Router>
            <Navbar />
            <div className="container mt-4">
                <Routes>
                    <Route path="/upload" element={<UploadPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/jobs" element={<JobsPage />} />
                    <Route path="/candidates/:id" element={<CandidatePage />} />
                    <Route path="/" element={<UploadPage />} /> 
                </Routes>
            </div>
        </Router>
    );
};

export default App;