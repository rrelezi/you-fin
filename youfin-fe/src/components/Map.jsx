import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import SpendingPopup from './SpendingPopup';
import {
  MapPinIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  ShoppingBagIcon,
  ArrowPathIcon,
  ChevronDoubleUpIcon,
  MicrophoneIcon,
  PaperAirplaneIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

// This ensures the icons work properly with Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom marker icons
const createIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const businessIcon = createIcon('blue');
const bankIcon = createIcon('red');
const dealIcon = createIcon('green');
const spendingIcon = createIcon('orange');

// Map location auto-center component
const ChangeView = ({ center }) => {
  const map = useMap();
  map.setView(center, 15);
  return null;
};

const Map = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [nearbyDeals, setNearbyDeals] = useState([]);
  const [spendingHistory, setSpendingHistory] = useState([]);
  const [selectedSpending, setSelectedSpending] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiResponses, setAiResponses] = useState([
    { role: 'assistant', content: 'Hello! I can help you find deals, analyze your spending, and give financial advice about places around you.' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([
    'Show me nearby deals',
    'How much have I spent nearby?',
    'Where should I save money?',
    'Find ATMs near me'
  ]);
  const mapRef = useRef(null);
  const chatEndRef = useRef(null);

  // Default center (Tirana, Albania)
  const defaultCenter = [41.3275, 19.8187];
  const catchRadius = 100; // meters

  useEffect(() => {
    // Get user's location and data
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          fetchInitialData(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Geolocation error:', error);
          fetchInitialData(defaultCenter[0], defaultCenter[1]);
        }
      );
    } else {
      fetchInitialData(defaultCenter[0], defaultCenter[1]);
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom of chat when new messages are added
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [aiResponses]);

  const fetchInitialData = async (lat, lng) => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      // Simulated API responses for development
      // In production, uncomment the real API calls below
      setTimeout(() => {
        const mockBusinesses = [
          { 
            _id: '1', 
            name: 'Raiffeisen Bank', 
            type: 'bank',
            description: 'Main banking branch with full services',
            location: { coordinates: [lng + 0.003, lat - 0.002] },
            raiffeisen_info: 'Open 9am-5pm Mon-Fri, ATM available 24/7'
          },
          { 
            _id: '2', 
            name: 'SuperMarket XYZ', 
            type: 'business',
            description: 'Grocery store with fresh local products',
            location: { coordinates: [lng - 0.002, lat + 0.001] } 
          },
          { 
            _id: '3', 
            name: 'TechStore', 
            type: 'business',
            description: 'Electronics and gadgets store',
            location: { coordinates: [lng + 0.001, lat + 0.003] } 
          },
          { 
            _id: '4', 
            name: 'CoffeeHouse', 
            type: 'business',
            description: 'Local coffee shop with free WiFi',
            location: { coordinates: [lng - 0.001, lat - 0.001] } 
          }
        ];

        const mockDeals = [
          { 
            businessId: '2', 
            offers: [
              { id: '101', title: '15% Off Groceries', description: 'Save on your purchase over $50' },
              { id: '102', title: 'Buy 1 Get 1 Free', description: 'On selected items' }
            ] 
          },
          { 
            businessId: '3', 
            offers: [
              { id: '103', title: '$30 Off Headphones', description: 'Premium headphones on sale today only' }
            ] 
          },
          { 
            businessId: '4', 
            offers: [
              { id: '104', title: 'Happy Hour 2-4pm', description: '50% off all drinks' }
            ] 
          }
        ];

        const mockSpending = [
          { 
            _id: 's1', 
            amount: -24.99, 
            category: 'Food', 
            timestamp: new Date('2023-07-01').toISOString(),
            description: 'Lunch at CoffeeHouse',
            location: { coordinates: [lng - 0.001, lat - 0.001] } 
          },
          { 
            _id: 's2', 
            amount: -89.50, 
            category: 'Tech', 
            timestamp: new Date('2023-06-28').toISOString(),
            description: 'USB-C Cable at TechStore',
            location: { coordinates: [lng + 0.001, lat + 0.003] }  
          },
          { 
            _id: 's3', 
            amount: -123.45, 
            category: 'Groceries', 
            timestamp: new Date('2023-06-25').toISOString(),
            description: 'Weekly groceries',
            location: { coordinates: [lng - 0.002, lat + 0.001] } 
          }
        ];

        const mockAiInsights = {
          summary: "I've analyzed your spending patterns around this area. You tend to spend most at SuperMarket XYZ, averaging $120 per visit. There's a deal available now that could save you about $18.",
          hotspots: [
            "CoffeeHouse - You visit 3x weekly, spending ~$25 each time",
            "TechStore - Monthly visits averaging $95 per purchase",
            "SuperMarket XYZ - Weekly grocery runs of $100-150"
          ],
          recommendations: [
            "The current 15% off deal at SuperMarket XYZ aligns with your typical grocery spend",
            "Your coffee spending is 20% higher than average. Consider the happy hour deal at CoffeeHouse",
            "Wait on tech purchases - better deals typically arrive next month"
          ]
        };

        setBusinesses(mockBusinesses);
        setNearbyDeals(mockDeals);
        setSpendingHistory(mockSpending);
        setAiInsights(mockAiInsights);
        setLoading(false);
      }, 1000);

      // Real API calls - uncomment for production
      /*
      const [businessesRes, dealsRes, spendingRes, aiRes] = await Promise.all([
        axios.get(`${API_URL}/api/businesses/nearby?lat=${lat}&lng=${lng}&distance=5000`),
        axios.get(`${API_URL}/api/businesses/offers`),
        axios.get(`${API_URL}/api/spending/user/1`), // Replace with actual user ID
        axios.get(`${API_URL}/api/ai/insights/location/1`) // Replace with actual user ID
      ]);

      setBusinesses(businessesRes.data);
      setNearbyDeals(dealsRes.data);
      setSpendingHistory(spendingRes.data);
      setAiInsights(aiRes.data);
      setLoading(false);
      */
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.response?.data?.message || 'Failed to load data. Please check if the backend server is running.');
      setLoading(false);
    }
  };

  const handleDealCatch = async (businessId, offerId) => {
    try {
      // Simulate API call
      const foundDeal = nearbyDeals.find(d => d.businessId === businessId)?.offers.find(o => o.id === offerId);
      
      if (foundDeal) {
        // Add response from AI
        setAiResponses(prev => [
          ...prev, 
          { 
            role: 'assistant', 
            content: `Great! You caught the "${foundDeal.title}" deal at ${businesses.find(b => b._id === businessId)?.name}. Based on your spending history, this deal could save you about $15. Would you like me to remind you to use this deal next time you're nearby?` 
          }
        ]);
        
        // Update deals list (remove caught deal)
        setNearbyDeals(prevDeals => 
          prevDeals.map(deal => 
            deal.businessId === businessId 
              ? { ...deal, offers: deal.offers.filter(o => o.id !== offerId) }
              : deal
          )
        );
      }

      // Uncomment for production
      /*
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${API_URL}/api/businesses/catch-deal`, {
        businessId,
        offerId,
        userId: '1', // Replace with actual user ID
        location: userLocation
      });

      // Get AI insights about the deal
      const aiResponse = await axios.post(`${API_URL}/api/ai/analyze-deal`, {
        dealType: response.data.type,
        userHistory: response.data.userHistory
      });

      // Update deals list
      setNearbyDeals(prevDeals => 
        prevDeals.map(deal => 
          deal.businessId === businessId 
            ? { ...deal, offers: deal.offers.filter(o => o.id !== offerId) }
            : deal
        )
      );

      // Add response from AI
      setAiResponses(prev => [...prev, { role: 'assistant', content: aiResponse.data.recommendation }]);
      */
    } catch (error) {
      console.error('Error catching deal:', error);
      alert('Failed to catch deal. Make sure you are close enough!');
    }
  };

  const isWithinRange = (businessLocation) => {
    if (!userLocation || !businessLocation) return false;
    
    const distance = L.latLng(userLocation).distanceTo(L.latLng(businessLocation));
    return distance <= catchRadius;
  };

  const toggleAiPanel = () => {
    setShowAiPanel(!showAiPanel);
  };

  const handleSuggestedQuestion = (question) => {
    setAiMessage(question);
    handleAiSubmit(null, question);
  };

  const handleAiSubmit = async (e, presetQuestion = null) => {
    if (e) e.preventDefault();
    
    const question = presetQuestion || aiMessage;
    if (!question.trim()) return;
    
    // Add user message to chat
    setAiResponses(prev => [...prev, { role: 'user', content: question }]);
    
    // Clear input and show typing indicator
    setAiMessage('');
    setIsTyping(true);
    
    try {
      // Simulate AI response (replace with actual API call in production)
      setTimeout(() => {
        let response = "I'm analyzing the nearby businesses and your spending patterns...";
        
        const lowerMsg = question.toLowerCase();
        
        if (lowerMsg.includes('deal') || lowerMsg.includes('offer') || lowerMsg.includes('nearby deal')) {
          response = "There are several deals nearby! I see discounts at SuperMarket XYZ (15% off) and a happy hour at CoffeeHouse. Based on your spending habits, I'd recommend checking out the grocery discount since you typically spend $120 there weekly.";
        } else if (lowerMsg.includes('spend') || lowerMsg.includes('budget') || lowerMsg.includes('spent nearby')) {
          response = "Looking at your spending in this area, you've spent $237.94 this month. Your biggest expense category is groceries ($123.45), followed by tech purchases ($89.50). You're actually 12% under your usual spending for this area!";
        } else if (lowerMsg.includes('save') || lowerMsg.includes('saving') || lowerMsg.includes('save money')) {
          response = "I notice you often buy coffee at CoffeeHouse ($25 per visit, 3x weekly). If you use their happy hour deal, you could save $37.50 per week. Over a month, that's $150 in savings just from optimizing when you buy coffee!";
        } else if (lowerMsg.includes('bank') || lowerMsg.includes('atm') || lowerMsg.includes('find atm')) {
          response = "The nearest bank is Raiffeisen Bank, about 300m northeast from your current location. They're open until 5pm today, and they have a 24/7 ATM available.";
        } else {
          response = "Based on your location and spending history, I can see you're near several businesses where you shop regularly. Need recommendations for deals, budget insights, or spending analysis for this area?";
        }
        
        setAiResponses(prev => [...prev, { role: 'assistant', content: response }]);
        setIsTyping(false);
        
        // Generate new suggested questions based on conversation
        generateSuggestedQuestions(question, response);
      }, 1500);
      
      // Uncomment for production
      /*
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const aiRes = await axios.post(`${API_URL}/api/ai/map-question`, {
        message: aiMessage,
        location: userLocation,
        userId: '1' // Replace with actual user ID
      });
      
      setAiResponses(prev => [...prev, { role: 'assistant', content: aiRes.data.response }]);
      */
    } catch (error) {
      console.error('Error getting AI response:', error);
      setAiResponses(prev => [...prev, { role: 'assistant', content: "I'm sorry, I had trouble processing that request. Please try again." }]);
      setIsTyping(false);
    }
  };

  const generateSuggestedQuestions = (userMessage, aiResponse) => {
    const lowerMsg = userMessage.toLowerCase();
    const lowerResponse = aiResponse.toLowerCase();
    
    let newQuestions = [];
    
    // Tailor follow-up questions based on conversation context
    if (lowerMsg.includes('deal') || lowerMsg.includes('offer')) {
      newQuestions = [
        'Which deal saves me the most?',
        'Are there any restaurant deals?',
        'Is the supermarket deal worth it?'
      ];
    } else if (lowerMsg.includes('spent') || lowerResponse.includes('spending')) {
      newQuestions = [
        'Where do I spend too much?',
        'Compare to my monthly budget',
        'Show my spending by category'
      ];
    } else if (lowerMsg.includes('save') || lowerResponse.includes('save')) {
      newQuestions = [
        'More saving opportunities',
        'Help me create a budget',
        'Best deals to save money'
      ];
    } else if (lowerMsg.includes('bank') || lowerMsg.includes('atm')) {
      newQuestions = [
        'When does the bank close?',
        'Any fees at this ATM?',
        'Other banks nearby?'
      ];
    } else {
      newQuestions = [
        'Show me nearby deals',
        'How much have I spent nearby?',
        'Where should I save money?',
        'Find ATMs near me'
      ];
    }
    
    setSuggestedQuestions(newQuestions);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-[#333] border-t-[#FFDE59] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500 rounded-xl text-white">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-[#FFDE59] text-black rounded-xl font-medium"
          onClick={() => fetchInitialData(defaultCenter[0], defaultCenter[1])}
        >
          <ArrowPathIcon className="w-5 h-5 inline mr-2" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-9rem)] md:h-[calc(100vh-5rem)] rounded-xl overflow-hidden">
      {/* Map */}
      <MapContainer
        center={userLocation || defaultCenter}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        zoomControl={false}
      >
        {userLocation && <ChangeView center={userLocation} />}
        
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* User location */}
        {userLocation && (
          <>
            <Marker position={userLocation}>
              <Popup>
                <div className="p-2 min-w-[150px]">
                  <h3 className="font-bold text-black">Your Location</h3>
                  <p className="text-xs text-gray-600">Deals are catchable within 100m radius</p>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={userLocation}
              radius={catchRadius}
              pathOptions={{ color: '#FFDE59', fillColor: '#FFDE59', fillOpacity: 0.1 }}
            />
          </>
        )}

        {/* Spending history markers */}
        {spendingHistory.map((spending) => (
          <Marker
            key={spending._id}
            position={[spending.location.coordinates[1], spending.location.coordinates[0]]}
            icon={spendingIcon}
            eventHandlers={{
              click: () => setSelectedSpending(spending)
            }}
          >
            {selectedSpending?._id === spending._id && (
              <Popup>
                <div className="p-2 min-w-[180px]">
                  <h3 className="font-bold text-black">{spending.description}</h3>
                  <p className={`text-sm font-medium ${spending.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {spending.amount.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    })}
                  </p>
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>{spending.category}</span>
                    <span>{new Date(spending.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              </Popup>
            )}
          </Marker>
        ))}

        {/* Businesses */}
        {businesses.map((business) => (
          <Marker
            key={business._id}
            position={[business.location.coordinates[1], business.location.coordinates[0]]}
            icon={business.type === 'bank' ? bankIcon : businessIcon}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-black">{business.name}</h3>
                <p className="text-sm text-gray-600">{business.description}</p>
                {business.type === 'bank' && (
                  <p className="text-sm text-blue-600 mt-2">{business.raiffeisen_info}</p>
                )}
                
                {nearbyDeals.find(d => d.businessId === business._id)?.offers.map(offer => (
                  <div key={offer.id} className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white mr-2">
                        <ShoppingBagIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-800">{offer.title}</p>
                        <p className="text-xs text-gray-600">{offer.description}</p>
                      </div>
                    </div>
                    
                    {isWithinRange([business.location.coordinates[1], business.location.coordinates[0]]) ? (
                      <button
                        onClick={() => handleDealCatch(business._id, offer.id)}
                        className="mt-2 w-full px-3 py-1.5 bg-[#FFDE59] text-black text-sm font-medium rounded-lg hover:bg-[#FFD42A] transition-colors duration-200"
                      >
                        Catch This Deal!
                      </button>
                    ) : (
                      <p className="text-xs text-orange-500 mt-2 flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        Get closer to catch this deal!
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* AI and Map Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col items-end space-y-3 z-[1000]">
        {/* Map Controls */}
        <div className="flex flex-col bg-[#1E1E1E]/90 backdrop-blur-lg rounded-xl overflow-hidden shadow-lg">
          <button 
            className="p-3 hover:bg-[#252525] transition-colors duration-200"
            onClick={() => mapRef.current && userLocation && mapRef.current.setView(userLocation, 15)}
          >
            <MapPinIcon className="w-6 h-6 text-[#FFDE59]" />
          </button>
          <div className="w-full h-px bg-[#333]"></div>
          <button 
            className="p-3 hover:bg-[#252525] transition-colors duration-200"
            onClick={() => fetchInitialData(userLocation?.[0] || defaultCenter[0], userLocation?.[1] || defaultCenter[1])}
          >
            <ArrowPathIcon className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* AI Button */}
        <button
          onClick={toggleAiPanel}
          className={`p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
            showAiPanel ? 'bg-red-500 rotate-45' : 'bg-gradient-to-r from-[#FFDE59] to-[#FFB74D]'
          }`}
        >
          <SparklesIcon className={`w-6 h-6 ${showAiPanel ? 'text-white' : 'text-black'}`} />
        </button>
      </div>

      {/* AI Panel */}
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ 
          x: showAiPanel ? 0 : '100%',
          opacity: showAiPanel ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="absolute top-0 right-0 bottom-0 w-full sm:w-96 bg-[#1A1A1A]/95 backdrop-blur-lg z-[999] border-l border-[#333] flex flex-col"
      >
        <div className="p-4 border-b border-[#333] flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center">
            <SparklesIcon className="w-5 h-5 mr-2 text-[#FFDE59]" />
            Map Assistant
          </h2>
          <button 
            onClick={toggleAiPanel}
            className="p-2 rounded-lg hover:bg-[#252525] transition-colors duration-200"
          >
            <ChevronDoubleUpIcon className="w-5 h-5 text-white rotate-90" />
          </button>
        </div>

        {/* AI Location Insights */}
        {aiInsights && (
          <div className="p-4 border-b border-[#333]">
            <h3 className="text-sm font-medium text-[#FFDE59] mb-2">Location Insights</h3>
            <p className="text-sm text-white mb-3">{aiInsights.summary}</p>
            
            <div className="space-y-2">
              {aiInsights.recommendations && aiInsights.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-5 h-5 rounded-full bg-[#FFDE59]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <SparklesIcon className="w-3 h-3 text-[#FFDE59]" />
                  </div>
                  <p className="text-xs text-[#B0B0B0]">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Chat */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {aiResponses.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-3 rounded-2xl ${
                  message.role === 'user' 
                    ? 'bg-[#FFDE59] text-black rounded-tr-none' 
                    : 'bg-[#252525] text-white rounded-tl-none'
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-2xl bg-[#252525] text-white rounded-tl-none">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-[#B0B0B0] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#B0B0B0] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-[#B0B0B0] rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Suggested Questions */}
        {suggestedQuestions.length > 0 && (
          <div className="p-4 border-t border-[#333] bg-[#252525]">
            <p className="text-xs text-[#B0B0B0] mb-2">Suggested Questions</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="text-xs bg-[#333] hover:bg-[#444] text-white py-1.5 px-3 rounded-full transition-colors duration-200"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI Input */}
        <form onSubmit={handleAiSubmit} className="p-4 border-t border-[#333] flex items-center space-x-2">
          <button
            type="button"
            className="p-2 rounded-full bg-[#252525] hover:bg-[#333] transition-colors duration-200"
          >
            <MicrophoneIcon className="w-5 h-5 text-[#B0B0B0]" />
          </button>
          
          <input
            type="text"
            value={aiMessage}
            onChange={(e) => setAiMessage(e.target.value)}
            placeholder="Ask about nearby deals, spending, or advice..."
            className="flex-1 bg-[#252525] border border-[#333] rounded-xl px-4 py-2 text-white placeholder-[#B0B0B0] focus:outline-none focus:border-[#FFDE59]"
          />
          
          <button
            type="submit"
            disabled={!aiMessage.trim() || isTyping}
            className={`p-2 rounded-full ${
              !aiMessage.trim() || isTyping
                ? 'bg-[#252525] text-[#B0B0B0]'
                : 'bg-[#FFDE59] text-black hover:bg-[#FFD42A]'
            } transition-colors duration-200`}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Map; 