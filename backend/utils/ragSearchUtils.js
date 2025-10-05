
const Resume = require('../models/Resume.js');

/**
 * Mocks the process of converting a text query into a vector (embedding).
 * @param {string} query The user's search query.
 * @returns {Array<number>} A mock 1536-dimension vector.
 */
const getQueryEmbedding = (query) => {
    console.log(`[RAG UTIL] Generating mock embedding for query: "${query}"`);
  
    return Array(1536).fill(0).map(() => Math.random());
};

/**
 * @param {Array<number>} embedding 
 * @param {string} jobId
 * @returns {Array<Object>} 
 */
const vectorSearch = async (embedding, jobId) => {
    console.log('[RAG UTIL] Performing mock vector search in MongoDB...');
    
    
    const allResumes = await Resume.find({});

   
    const topMatches = allResumes.slice(0, 3).map((resume, index) => ({
        candidateName: resume.candidateName,
        matchScore: (1 - index * 0.1).toFixed(2), 
        content: resume.content, 
        _id: resume._id,
    }));
    
    return topMatches;
};


/**
 * @param {string} query 
 * @param {Array<Object>} context 
 * @returns {string} 
 */
const generateLLMResponse = (query, context) => {
    console.log('[RAG UTIL] Generating mock LLM response...');

    const matchedNames = context.map(c => c.candidateName).join(', ');
    
    const synthesizedAnswer = `Based on your request "${query}", I have found ${context.length} highly relevant candidates. 
    
    The top matches are: ${matchedNames}. 
    
    The highest-ranking candidate, ${context[0].candidateName}, has a match score of ${context[0].matchScore}, indicating a strong fit with the skills and experience detailed in the retrieved resume content. Please check the provided sources for full details.`;
    
    return synthesizedAnswer;
};


/**
 * @param {string} query 
 * @param {string} jobId 
 * @returns {Object} 
 */
 module.exports  = async (query, jobId = null) => {
    try {
        const queryEmbedding = getQueryEmbedding(query);

       
        const sourceResumes = await vectorSearch(queryEmbedding, jobId);
        
        if (!sourceResumes || sourceResumes.length === 0) {
            return {
                answer: `No relevant candidates were found for your query: "${query}". Please try a different search term or upload more resumes.`,
                sources: [],
            };
        }

      
        const synthesizedAnswer = generateLLMResponse(query, sourceResumes);

        return {
            answer: synthesizedAnswer,
            sources: sourceResumes,
        };

    } catch (error) {
        console.error('CRITICAL RAG PIPELINE ERROR:', error);
        throw new Error(`RAG search failed: ${error.message}`);
    }
};