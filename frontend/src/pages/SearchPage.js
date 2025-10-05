import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const SearchPage = () => {
    const [simpleQuery, setSimpleQuery] = useState('');
    const [ragQuery, setRagQuery] = useState('Who are the candidates with Node.js experience?');
    const [simpleResults, setSimpleResults] = useState([]);
    const [ragAnswer, setRagAnswer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ limit: 5, offset: 0, total: 0 });

    const fetchResumes = async (currentOffset) => {
        setLoading(true);
        try {
            const response = await axios.get('/api/resumes', {
                params: {
                    limit: pagination.limit,
                    offset: currentOffset,
                    q: simpleQuery
                }
            });
            setSimpleResults(response.data.resumes);
            setPagination({ ...pagination, offset: currentOffset, total: response.data.total });
        } catch (error) {
            console.error("Error fetching resumes:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResumes(0); 
    }, [simpleQuery]);

    const handleRagSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setRagAnswer(null);

        try {
            const response = await axios.post('/api/ask', {
                query: ragQuery,
                k: 3 
            });
            setRagAnswer(response.data);
        } catch (error) {
            alert(`RAG Search Error: ${error.response?.data?.message || 'Failed to search.'}`);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newOffset) => {
        fetchResumes(newOffset);
    };

    return (
        <div>
            <h2>🔍 Resume Search & Q&A</h2>
            <p>Use the RAG Q&A section for complex, evidence-backed questions, and the simple search for basic filtering.</p>

            <div className="card my-4">
                <div className="card-header bg-primary text-white">
                    <h5>RAG-Powered Q&A </h5>
                </div>
                <div className="card-body">
                    <form onSubmit={handleRagSearch}>
                        <div className="mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Ask a question about the candidates..."
                                value={ragQuery}
                                onChange={(e) => setRagQuery(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-dark" disabled={loading}>
                            {loading ? 'Thinking...' : 'Get Answer with Evidence (k=3)'}
                        </button>
                    </form>

                    {ragAnswer && (
                        <div className="mt-3">
                            <strong>Answer:</strong>
                            <p className="alert alert-success">{ragAnswer.answer}</p>
                            <strong>Evidence Snippets:</strong>
                            <ul>
                                {ragAnswer.evidence.map((snippet, index) => (
                                    <li key={index} className="small text-muted">{snippet}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <hr />
            <h3>Simple Candidate List </h3>
            <input
                type="text"
                className="form-control mb-3"
                placeholder="Filter by keyword..."
                value={simpleQuery}
                onChange={(e) => setSimpleQuery(e.target.value)}
            />

            {simpleResults.map((resume) => (
                <div key={resume._id} className="card mb-2">
                    <div className="card-body">
                        <h5 className="card-title">{resume.candidateName}</h5>
                        <p className="card-text small text-muted">File: {resume.fileName} | Uploaded: {new Date(resume.uploadedAt).toLocaleDateString()}</p>
                        <Link to={`/candidates/${resume._id}`} className="btn btn-sm btn-outline-info">
                            View Candidate
                        </Link>
                    </div>
                </div>
            ))}

            <nav aria-label="Page navigation">
                <ul className="pagination justify-content-center">
                    <li className={`page-item ${pagination.offset === 0 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(pagination.offset - pagination.limit)}>Previous</button>
                    </li>
                    <li className="page-item disabled">
                        <span className="page-link">
                            Page {pagination.offset / pagination.limit + 1} of {Math.ceil(pagination.total / pagination.limit)} (Total: {pagination.total})
                        </span>
                    </li>
                    <li className={`page-item ${pagination.offset + pagination.limit >= pagination.total ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(pagination.offset + pagination.limit)}>Next</button>
                    </li>
                </ul>
            </nav>

        </div>
    );
};

export default SearchPage;