import React, { useState, useEffect } from 'react';
import { useOnlineStatus } from '../../hooks/usePwaFeatures';
import './OfflineVotingSystem.css';

const OfflineVotingSystem = ({ submissionId, initialRating = 0, onVote }) => {
  const isOnline = useOnlineStatus();
  const [rating, setRating] = useState(initialRating);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [offlineVoteSuccess, setOfflineVoteSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reset states when initialRating changes (e.g., when viewing a different submission)
  useEffect(() => {
    setRating(initialRating);
    setHasVoted(initialRating > 0);
    setOfflineVoteSuccess(false);
  }, [initialRating, submissionId]);
  
  const handleMouseEnter = (value) => {
    if (hasVoted) return;
    setHoveredRating(value);
  };
  
  const handleMouseLeave = () => {
    setHoveredRating(0);
  };
  
  const handleClick = async (value) => {
    if (hasVoted || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      if (isOnline) {
        // Online voting - use the provided onVote callback
        await onVote(submissionId, value);
        setRating(value);
        setHasVoted(true);
      } else {
        // Offline voting - save to IndexedDB for later sync
        const voteData = {
          submissionId,
          rating: value,
          timestamp: new Date().toISOString(),
          synced: false
        };
        
        // Import dynamically to avoid circular dependencies
        const { saveVoteOffline } = await import('../../services/offlineStorage');
        await saveVoteOffline(voteData);
        
        setRating(value);
        setHasVoted(true);
        setOfflineVoteSuccess(true);
        
        // Register for background sync if available
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          const registration = await navigator.serviceWorker.ready;
          await registration.sync.register('sync-votes');
        }
      }
    } catch (error) {
      console.error('Voting error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getStarClass = (value) => {
    if (hasVoted) {
      return value <= rating ? 'star filled' : 'star';
    }
    return value <= (hoveredRating || rating) ? 'star filled' : 'star';
  };
  
  return (
    <div className="offline-voting-system">
      {!isOnline && !hasVoted && (
        <div className="offline-vote-notice">
          <p>You're offline. Your vote will be saved and submitted when you're back online.</p>
        </div>
      )}
      
      {offlineVoteSuccess && (
        <div className="offline-vote-success">
          <p>Your vote has been saved offline and will be submitted when you're back online.</p>
        </div>
      )}
      
      <div className="rating-label">
        {hasVoted ? 'Your Rating:' : 'Rate this submission:'}
      </div>
      
      <div className="star-rating" role="group" aria-label="Rating">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
          <button
            key={value}
            type="button"
            className={getStarClass(value)}
            onMouseEnter={() => handleMouseEnter(value)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(value)}
            disabled={hasVoted || isSubmitting}
            aria-label={`${value} stars`}
          >
            {value}
          </button>
        ))}
      </div>
      
      <div className="rating-value">
        {hoveredRating || rating || 0}/10
      </div>
      
      {hasVoted && isOnline && (
        <div className="vote-success">
          <p>Thank you for your vote!</p>
        </div>
      )}
      
      {isSubmitting && (
        <div className="vote-loading">
          <div className="spinner-small"></div>
          <span>Submitting vote...</span>
        </div>
      )}
    </div>
  );
};

export default OfflineVotingSystem;
