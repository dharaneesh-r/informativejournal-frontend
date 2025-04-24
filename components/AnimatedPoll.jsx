// components/AnimatedPoll.jsx
'use client';
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { FaChartBar, FaVoteYea, FaUsers, FaClock } from 'react-icons/fa';

const AnimatedPoll = ({ articleId }) => {
  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pollRef = useRef(null);
  const optionRefs = useRef([]);

  // Fetch poll data
  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const response = await fetch(
          `https://informativejournal-backend.vercel.app/polls/${articleId}`
        );
        const data = await response.json();
        
        if (data.status === 'success' && data.data.length > 0) {
          setPoll(data.data[0]);
          // Check localStorage for existing vote
          const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '{}');
          if (votedPolls[data.data[0]._id]) setHasVoted(true);
        }
      } catch (error) {
        console.error('Poll fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPoll();
  }, [articleId]);

  // GSAP Animations
  useEffect(() => {
    if (!pollRef.current || isLoading) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.from(pollRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.6
    });

    optionRefs.current.forEach((ref, i) => {
      if (ref) {
        tl.from(
          ref,
          {
            x: i % 2 === 0 ? -20 : 20,
            opacity: 0,
            duration: 0.4
          },
          i * 0.1
        );
      }
    });

    return () => tl.kill();
  }, [isLoading, poll]);

  const handleVote = async () => {
    if (!poll || hasVoted || selectedOption === null) return;

    try {
      // Animate selection
      gsap.to(optionRefs.current[selectedOption], {
        scale: 0.95,
        backgroundColor: '#f3f4f6',
        duration: 0.2,
        yoyo: true,
        repeat: 1
      });

      // Submit vote to backend
      const response = await fetch(
        `https://informativejournal-backend.vercel.app/polls/${articleId}/vote`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ optionIndex: selectedOption }),
        }
      );
      
      const result = await response.json();
      
      if (result.status === 'success') {
        // Update local state with new poll data
        setPoll(result.data);
        setHasVoted(true);
        
        // Store vote in localStorage
        const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '{}');
        votedPolls[poll._id] = true;
        localStorage.setItem('votedPolls', JSON.stringify(votedPolls));

        // Animate results
        const tl = gsap.timeline();
        tl.to('.poll-option', { opacity: 0.6, duration: 0.3 })
          .to('.poll-option', { opacity: 1, duration: 0.3 });
      }
    } catch (error) {
      gsap.to(pollRef.current, {
        x: -10,
        duration: 0.1,
        repeat: 5,
        yoyo: true,
        onComplete: () => gsap.to(pollRef.current, { x: 0 })
      });
      console.error('Voting failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 max-w-md mx-auto animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!poll) return null;

  return (
    <div 
      ref={pollRef}
      className="bg-white rounded-xl shadow-lg overflow-hidden max-w-md mx-auto transform transition-all duration-300 hover:shadow-xl"
    >
      <div className="p-6">
        <div className="flex items-center mb-3">
          <FaChartBar className="text-blue-600 mr-2" />
          <h3 className="text-xl font-bold text-gray-800">{poll.question}</h3>
        </div>
        
        <div className="space-y-3 mb-6">
          {poll.options.map((option, index) => (
            <div 
              key={option._id}
              ref={el => optionRefs.current[index] = el}
              className={`poll-option relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer
                ${hasVoted ? 'pointer-events-none' : 'hover:border-blue-400'}
                ${selectedOption === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
              `}
              onClick={() => !hasVoted && setSelectedOption(index)}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{option.text}</span>
                
                {hasVoted && (
                  <span className="text-sm font-semibold">
                    {poll.totalVotes > 0 
                      ? `${Math.round((option.votes / poll.totalVotes) * 100)}%` 
                      : '0%'}
                  </span>
                )}
              </div>

              {hasVoted && (
                <div 
                  className="absolute bottom-0 left-0 h-1 bg-blue-400 rounded-full transition-all duration-1000"
                  style={{
                    width: `${poll.totalVotes > 0 
                      ? (option.votes / poll.totalVotes) * 100 
                      : 0}%`
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {!hasVoted ? (
          <button
            onClick={handleVote}
            disabled={selectedOption === null}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center
              ${selectedOption === null 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'}
            `}
          >
            <FaVoteYea className="mr-2" />
            Submit Vote
          </button>
        ) : (
          <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
            <div className="flex items-center">
              <FaUsers className="mr-1" />
              <span>{poll.totalVotes} votes</span>
            </div>
            <div className="flex items-center">
              <FaClock className="mr-1" />
              <span>Closes {new Date(poll.expiresAt).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimatedPoll;