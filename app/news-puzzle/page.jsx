'use client'
import { useState, useEffect } from 'react';

const Newsdle = () => {
  const [dailyKeyword, setDailyKeyword] = useState('');
  const [articleHint, setArticleHint] = useState('');
  const [guesses, setGuesses] = useState(Array(6).fill(''));
  const [currentGuess, setCurrentGuess] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch random article and set keyword
  useEffect(() => {
    const fetchDailyKeyword = async () => {
      try {
        const response = await fetch('https://informativejournal-backend.vercel.app/articles');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const articles = await response.json();
        
        if (!articles || articles.length === 0) {
          throw new Error('No articles found in response');
        }

        // Select random article
        const randomArticle = articles[Math.floor(Math.random() * articles.length)];
        
        // Use title as the keyword (cleaned up)
        const keyword = cleanKeyword(randomArticle.title);
        
        // Use description as hint, fallback to title if no description
        const hint = randomArticle.description || randomArticle.title;
        
        setDailyKeyword(keyword.toUpperCase());
        setArticleHint(hint);
        
        // Initialize game state
        const savedGame = sessionStorage.getItem('newsdleGame');
        if (!savedGame) {
          saveGameState(keyword.toUpperCase(), Array(6).fill(''), 0, false, false);
        }
      } catch (err) {
        console.error("API Error:", err);
        setError(`Failed to load articles: ${err.message}`);
        // Fallback data
        const fallback = getFallbackWord();
        setDailyKeyword(fallback.word);
        setArticleHint(fallback.hint);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyKeyword();
  }, []);

  // Clean the keyword (remove special chars, take first word)
  const cleanKeyword = (title) => {
    if (!title) return 'NEWS';
    
    // Take the first word and remove non-alphabetic characters
    const cleaned = title.split(/\s+/)[0].replace(/[^a-zA-Z]/g, '');
    return cleaned || 'NEWS';
  };

  // Fallback words if API fails
  const getFallbackWord = () => {
    const fallbacks = [
      { word: 'NEWS', hint: 'Latest updates and information' },
      { word: 'MEDIA', hint: 'Communication channels and journalism' },
      { word: 'TREND', hint: 'Current popular topics' },
      { word: 'REPORT', hint: 'Detailed account of events' },
      { word: 'UPDATE', hint: 'Most recent information' }
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  };

  const saveGameState = (keyword, guesses, attempt, gameOver, won) => {
    const gameState = {
      keyword,
      guesses,
      attempt,
      gameOver,
      won,
      hint: articleHint
    };
    sessionStorage.setItem('newsdleGame', JSON.stringify(gameState));
  };

  const handleKeyDown = (e) => {
    if (gameOver || loading) return;

    if (e.key === 'Enter') {
      if (currentGuess.length === dailyKeyword.length) {
        const newGuesses = [...guesses];
        newGuesses[attempt] = currentGuess;
        setGuesses(newGuesses);
        
        if (currentGuess.toUpperCase() === dailyKeyword) {
          setGameOver(true);
          setWon(true);
        } else if (attempt === 5) {
          setGameOver(true);
        }
        
        setAttempt(attempt + 1);
        setCurrentGuess('');
        saveGameState(dailyKeyword, newGuesses, attempt + 1, 
          currentGuess.toUpperCase() === dailyKeyword || attempt === 5, 
          currentGuess.toUpperCase() === dailyKeyword);
      }
    } else if (e.key === 'Backspace') {
      setCurrentGuess(currentGuess.slice(0, -1));
    } else if (/^[A-Za-z]$/.test(e.key) && currentGuess.length < dailyKeyword.length) {
      setCurrentGuess(currentGuess + e.key.toUpperCase());
    }
  };

  const getLetterColor = (letter, position) => {
    if (!letter) return 'bg-white';
    if (dailyKeyword[position] === letter) {
      return 'bg-green-500 text-white';
    } else if (dailyKeyword.includes(letter)) {
      return 'bg-yellow-500 text-white';
    }
    return 'bg-gray-300 text-black';
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Loading today's Newsdle...</h1>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="grid grid-rows-6 gap-2 mb-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex gap-2 justify-center">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="w-12 h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4" tabIndex="0" onKeyDown={handleKeyDown}>
      <h1 className="text-2xl font-bold mb-4 text-center">Newsdle</h1>
      <p className="text-center mb-2">Guess the news keyword in 6 tries</p>
      
      {error && (
        <div className="bg-yellow-50 p-3 rounded-lg mb-4 text-yellow-800">
          <p>{error}</p>
          <p className="text-sm">Using fallback word: {dailyKeyword}</p>
        </div>
      )}
      
      {/* Hint Component */}
      <div className="bg-blue-50 p-3 rounded-lg mb-4">
        <h3 className="font-semibold text-blue-800 mb-1">Today's Hint:</h3>
        <p className="text-blue-700 italic">{articleHint}</p>
      </div>
      
      <div className="grid grid-rows-6 gap-2 mb-6">
        {guesses.map((guess, i) => (
          <div key={i} className="flex gap-2 justify-center">
            {dailyKeyword.split('').map((_, j) => (
              <div 
                key={j} 
                className={`w-12 h-12 border-2 flex items-center justify-center text-xl font-bold rounded
                  ${i < attempt ? getLetterColor(guess[j], j) : 
                   i === attempt ? (currentGuess[j] ? 'border-gray-400' : 'border-gray-200') : 
                   'border-gray-200'}`}
              >
                {i < attempt ? guess[j] : i === attempt ? currentGuess[j] : ''}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {gameOver && (
        <div className="text-center">
          {won ? (
            <p className="text-green-600 font-bold">Congratulations! You guessed "{dailyKeyword}"!</p>
          ) : (
            <div>
              <p className="text-red-600">Game over! The word was: {dailyKeyword}</p>
              <p className="mt-2 text-sm">From article: {articleHint}</p>
            </div>
          )}
          <button 
            onClick={() => {
              sessionStorage.removeItem('newsdleGame');
              window.location.reload();
            }}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Play Again
          </button>
        </div>
      )}
      
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Each guess must be a {dailyKeyword.length}-letter word</p>
        {error && (
          <p className="mt-2 text-xs">Note: Using fallback word due to API issues</p>
        )}
      </div>
    </div>
  );
};

export default Newsdle;