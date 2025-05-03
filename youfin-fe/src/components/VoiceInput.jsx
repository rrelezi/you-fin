import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VoiceInput = ({ onExpenseAdded }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (window.webkitSpeechRecognition) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
        processExpense(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError('Speech recognition failed. Please try again.');
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognition);
    }
  }, []);

  const processExpense = async (text) => {
    try {
      setProcessing(true);
      setError(null);

      // Send to backend AI endpoint for processing
      const response = await axios.post('http://localhost:8000/api/ai/process-expense', {
        text
      });

      const { amount, category, description, confidence } = response.data;

      if (confidence < 0.5) {
        setError('Low confidence in expense recognition. Please try again with clearer wording.');
        return;
      }

      // Create expense
      const expenseResponse = await axios.post('http://localhost:8000/api/spending', {
        userId: '1', // Replace with actual user ID
        amount,
        category,
        description,
        businessId: '1' // Replace with actual business ID or make dynamic
      });

      if (onExpenseAdded) {
        onExpenseAdded(expenseResponse.data);
      }

      // Clear transcript and error
      setTranscript('');
      setError(null);
    } catch (error) {
      console.error('Error processing expense:', error);
      setError(error.response?.data?.message || 'Failed to process expense. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const toggleListening = () => {
    if (!recognition) {
      setError('Speech recognition is not supported in your browser');
      return;
    }

    setError(null);
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex flex-col items-center space-y-4">
        <button
          onClick={toggleListening}
          disabled={processing}
          className={`p-4 rounded-full transition-all ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : processing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </button>
        <p className="text-sm text-gray-600">
          {isListening 
            ? 'Listening...' 
            : processing 
            ? 'Processing...'
            : 'Click to start recording'}
        </p>
        {transcript && (
          <div className="w-full p-3 bg-gray-50 rounded-md">
            <p className="text-gray-700">{transcript}</p>
          </div>
        )}
        {error && (
          <div className="w-full p-3 bg-red-50 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        {processing && (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <p className="text-sm text-gray-600">Processing with AI...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceInput; 