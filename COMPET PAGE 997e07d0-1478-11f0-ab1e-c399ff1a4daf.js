import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCompetition } from '../../hooks/useCompetitions';
import { useAuth } from '../../hooks/useAuth';
import { useOnlineStatus } from '../../hooks/usePwaFeatures';
import './CompetitionDetailsPage.css';

const CompetitionDetailsPage = () => {
  const { id } = useParams();
  const { competition, submissions, loading, error } = useCompetition(id);
  const { user } = useAuth();
  const isOnline = useOnlineStatus();
  const [activeTab, setActiveTab] = useState('details');
  
  if (loading) {
    return (
      <div className="competition-details-page">
        <div className="container">
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Loading competition details...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !competition) {
    return (
      <div className="competition-details-page">
        <div className="container">
          <div className="error-message">
            <p>Error loading competition details. {!isOnline && 'You are currently offline.'}</p>
            <div className="error-actions">
              <button 
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
              <Link to="/competitions" className="btn btn-outline">
                Back to Competitions
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const isActive = new Date(competition.endDate) > new Date();
  const canSubmit = isActive && isOnline && user;
  const hasSubmitted = user && submissions.some(sub => sub.userId === user.uid);
  
  return (
    <div className="competition-details-page">
      <div className="competition-hero" style={{ backgroundImage: `url(${competition.bannerUrl || '/images/competitions/default-banner.jpg'})` }}>
        <div className="container">
          <div className="competition-hero-content">
            <div className="competition-meta-top">
              <span className={`competition-badge ${competition.userType}`}>
                {competition.userType === 'individual' ? 'Individual' : 'Business'}
              </span>
              <span className="competition-category">{competition.category}</span>
            </div>
            <h1>{competition.title}</h1>
            <div className="competition-meta-bottom">
              <div className="competition-stats">
                <div className="stat">
                  <span className="stat-value">{submissions.length}</span>
                  <span className="stat-label">Submissions</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{competition.votesCount || 0}</span>
                  <span className="stat-label">Votes</span>
                </div>
                <div className="stat">
                  <span className="stat-value">
                    {isActive 
                      ? `${getDaysRemaining(competition.endDate)} days`
                      : 'Ended'}
                  </span>
                  <span className="stat-label">
                    {isActive ? 'Remaining' : 'Status'}
                  </span>
                </div>
              </div>
              
              {canSubmit && !hasSubmitted && (
                <Link to={`/competitions/${id}/submit`} className="btn btn-primary">
                  Submit Entry
                </Link>
              )}
              
              {canSubmit && hasSubmitted && (
                <span className="submission-status">You've submitted an entry</span>
              )}
              
              {!isActive && (
                <span className="competition-ended">Competition has ended</span>
              )}
              
              {!user && isActive && (
                <Link to="/login" className="btn btn-primary">
                  Login to Submit
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="container">
        <div className="competition-tabs">
          <button 
            className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button 
            className={`tab-button ${activeTab === 'submissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('submissions')}
          >
            Submissions ({submissions.length})
          </button>
          <button 
            className={`tab-button ${activeTab === 'rules' ? 'active' : ''}`}
            onClick={() => setActiveTab('rules')}
          >
            Rules
          </button>
        </div>
        
        <div className="competition-content">
          {activeTab === 'details' && (
            <div className="competition-details">
              <div className="competition-description">
                <h2>About this Competition</h2>
                <p>{competition.description}</p>
                
                <div className="competition-organizer">
                  <h3>Organized by</h3>
                  <div className="organizer-info">
                    <img 
                      src={competition.organizerPhotoUrl || '/images/default-avatar.png'} 
                      alt={competition.organizerName} 
                      className="organizer-avatar"
                    />
                    <div>
                      <p className="organizer-name">{competition.organizerName}</p>
                      <p className="organizer-type">{competition.userType === 'individual' ? 'Individual Creator' : 'Business'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="competition-dates">
                  <div className="date-item">
                    <span className="date-label">Start Date:</span>
                    <span className="date-value">{formatDate(competition.startDate)}</span>
                  </div>
                  <div className="date-item">
                    <span className="date-label">End Date:</span>
                    <span className="date-value">{formatDate(competition.endDate)}</span>
                  </div>
                </div>
                
                {competition.prizes && (
                  <div className="competition-prizes">
                    <h3>Prizes</h3>
                    <div className="prizes-list">
                      {competition.prizes.map((prize, index) => (
                        <div key={index} className="prize-item">
                          <div className="prize-position">{getOrdinal(index + 1)}</div>
                          <div className="prize-details">
                            <p className="prize-title">{prize.title}</p>
                            <p className="prize-description">{prize.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="competition-sidebar">
                <div className="sidebar-card">
                  <h3>How to Participate</h3>
                  <ol className="participation-steps">
                    <li>
                      <span className="step-number">1</span>
                      <span className="step-text">Create your submission</span>
                    </li>
                    <li>
                      <span className="step-number">2</span>
                      <span className="step-text">Upload your entry</span>
                    </li>
                    <li>
                      <span className="step-number">3</span>
                      <span className="step-text">Share with friends</span>
                    </li>
                    <li>
                      <span className="step-number">4</span>
                      <span className="step-text">Get votes and feedback</span>
                    </li>
                  </ol>
                  
                  {canSubmit && !hasSubmitted && (
                    <Link to={`/competitions/${id}/submit`} className="btn btn-primary btn-block">
                      Submit Your Entry
                    </Link>
                  )}
                </div>
                
                <div className="sidebar-card">
                  <h3>Share Competition</h3>
                  <div className="share-buttons">
                    <button className="share-button facebook">
                      <i className="icon-facebook"></i>
                    </button>
                    <button className="share-button twitter">
                      <i className="icon-twitter"></i>
                    </button>
                    <button className="share-button linkedin">
                      <i className="icon-linkedin"></i>
                    </button>
                    <button className="share-button copy">
                      <i className="icon-link"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'submissions' && (
            <div className="competition-submissions">
              {submissions.length === 0 ? (
                <div className="empty-submissions">
                  <div className="empty-icon">🏆</div>
                  <h2>No submissions yet</h2>
                  <p>Be the first to submit your entry to this competition!</p>
                  
                  {canSubmit && !hasSubmitted && (
                    <Link to={`/competitions/${id}/submit`} className="btn btn-primary">
                      Submit Entry
                    </Link>
                  )}
                </div>
              ) : (
                <div className="submissions-grid">
                  {submissions.map(submission => (
                    <div key={submission.id} className="submission-card">
                      <div className="submission-media">
                        {submission.mediaType === 'image' ? (
                          <img src={submission.mediaUrl} alt={submission.title} />
                        ) : submission.mediaType === 'video' ? (
                          <div className="video-placeholder">
                            <i className="icon-play"></i>
                          </div>
                        ) : (
                          <div className="file-placeholder">
                            <i className="icon-file"></i>
                          </div>
                        )}
                      </div>
                      <div className="submission-content">
                        <h3>{submission.title}</h3>
                        <p className="submission-description">{submission.description}</p>
                        <div className="submission-meta">
                          <div className="submission-author">
                            <img 
                              src={submission.authorPhotoUrl || '/images/default-avatar.png'} 
                              alt={submission.authorName} 
                              className="author-avatar"
                            />
                            <span>{submission.authorName}</span>
                          </div>
                          <div className="submission-rating">
                            <span className="rating-value">{submission.averageRating || '0.0'}</span>
                            <span className="rating-count">({submission.votesCount || 0} votes)</span>
                          </div>
                        </div>
                        <Link to={`/submissions/${submission.id}`} className="btn btn-outline btn-sm">
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'rules' && (
            <div className="competition-rules">
              <h2>Competition Rules</h2>
              <div className="rules-content">
                {competition.rules ? (
                  <div dangerouslySetInnerHTML={{ __html: competition.rules }} />
                ) : (
                  <div className="default-rules">
                    <h3>General Rules</h3>
                    <ul>
                      <li>All submissions must be original work created by the participant.</li>
                      <li>Participants may submit only one entry per competition.</li>
                      <li>Submissions must adhere to the theme and guidelines of the competition.</li>
                      <li>By submitting an entry, participants grant VoteNest the right to display their work on the platform.</li>
                      <li>Voting is open to all registered users.</li>
                      <li>The decision of the judges and community votes is final.</li>
                    </ul>
                    
                    <h3>Submission Guidelines</h3>
                    <ul>
                      <li>All entries must be submitted before the competition end date.</li>
                      <li>Submissions must not contain offensive, inappropriate, or copyrighted material.</li>
                      <li>File size and format restrictions may apply depending on the competition category.</li>
                      <li>Incomplete or non-conforming submissions may be disqualified.</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Offline Message */}
      {!isOnline && (
        <div className="container">
          <div className="offline-message">
            <p>
              <strong>You're offline.</strong> Some features may be limited until you're back online.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions
const getDaysRemaining = (endDateString) => {
  const endDate = new Date(endDateString);
  const today = new Date();
  const diffTime = endDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const getOrdinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export default CompetitionDetailsPage;
