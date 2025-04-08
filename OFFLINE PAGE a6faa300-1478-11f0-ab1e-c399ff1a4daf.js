import React, { useState, useEffect } from 'react';
import { useOnlineStatus } from '../../hooks/usePwaFeatures';
import './OfflinePage.css';

const OfflinePage = () => {
  const isOnline = useOnlineStatus();
  const [cachedCompetitions, setCachedCompetitions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Redirect to home if online
  useEffect(() => {
    if (isOnline) {
      window.location.href = '/';
    }
  }, [isOnline]);
  
  // Load cached competitions from IndexedDB
  useEffect(() => {
    const loadCachedData = async () => {
      try {
        setIsLoading(true);
        
        // Import dynamically to avoid circular dependencies
        const { getCachedCompetitions } = await import('../../services/offlineStorage');
        const competitions = await getCachedCompetitions();
        
        setCachedCompetitions(competitions);
      } catch (error) {
        console.error('Error loading cached data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCachedData();
  }, []);
  
  return (
    <div className="offline-page">
      <div className="container">
        <div className="offline-header">
          <div className="offline-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="1" y1="1" x2="23" y2="23"></line>
              <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
              <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
              <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
              <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
              <line x1="12" y1="20" x2="12.01" y2="20"></line>
            </svg>
          </div>
          <h1>You're Offline</h1>
          <p className="offline-subtitle">
            Don't worry, you can still access previously viewed competitions and your saved submissions.
          </p>
        </div>
        
        <div className="offline-content">
          <h2>Cached Competitions</h2>
          
          {isLoading ? (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Loading cached data...</p>
            </div>
          ) : cachedCompetitions.length === 0 ? (
            <div className="empty-state">
              <p>No competitions available offline. Once you're back online, browse some competitions to make them available offline.</p>
            </div>
          ) : (
            <div className="cached-competitions">
              {cachedCompetitions.map(competition => (
                <div key={competition.id} className="cached-competition-card">
                  <h3>{competition.title}</h3>
                  <p className="competition-description">{competition.description}</p>
                  <div className="competition-meta">
                    <span className="category">{competition.category}</span>
                    <span className="cached-date">
                      Cached: {formatDate(competition.lastUpdated)}
                    </span>
                  </div>
                  <button 
                    className="btn btn-outline"
                    onClick={() => window.location.href = `/competitions/${competition.id}`}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="offline-actions">
            <h2>What You Can Do Offline</h2>
            <div className="offline-features">
              <div className="feature-card">
                <div className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <h3>View Cached Competitions</h3>
                <p>Browse competitions you've previously viewed while online.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </div>
                <h3>Create Submissions</h3>
                <p>Prepare and save submissions that will be uploaded when you're back online.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
                <h3>Vote on Submissions</h3>
                <p>Rate submissions you've viewed. Your votes will be synced when you're online again.</p>
              </div>
            </div>
          </div>
          
          <div className="connection-check">
            <button 
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Check Connection
            </button>
            <p>Click to check if you're back online</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export default OfflinePage;
