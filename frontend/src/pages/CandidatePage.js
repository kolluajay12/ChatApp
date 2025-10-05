import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const CandidatePage = () => {
    const { id } = useParams();
    const [candidate, setCandidate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCandidate = async () => {
            try {
                const response = await axios.get(`/api/resumes/${id}`);
                setCandidate(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch candidate details.');
            } finally {
                setLoading(false);
            }
        };
        fetchCandidate();
    }, [id]);

    if (loading) {
        return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>;
    }

    if (error) {
        return <div className="alert alert-danger mt-5">Error: {error}</div>;
    }

    if (!candidate) {
        return <div className="alert alert-warning mt-5">Candidate not found.</div>;
    }

    return (
        <div className="card mt-4">
            <div className="card-header bg-info text-white">
                <h2>Candidate Profile: {candidate.candidateName}</h2>
                <p className="mb-0 small">Resume ID: {candidate._id} | File: {candidate.fileName}</p>
            </div>
            <div className="card-body">
                
                <h4 className="mt-3">Redacted Resume Content</h4>
                <p className="text-muted small">
                    *This view shows the content used for search and matching, with PII (e.g., phone, email) redacted for privacy.
                </p>
                <pre className="p-3 border rounded bg-light" style={{ whiteSpace: 'pre-wrap' }}>
                    {candidate.content}
                </pre>

                <h4 className="mt-4 text-danger">Recruiter Access (Original Content)</h4>
                <div className="alert alert-warning">
                    <p className="mb-1">
                        **PII Warning:** The following content contains Personal Identifiable Information (PII) and should only be accessed by authorized recruiters.
                    </p>
                    <pre className="p-3 border rounded bg-white" style={{ whiteSpace: 'pre-wrap', borderLeft: '5px solid red' }}>
                        {candidate.originalContent}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default CandidatePage;