import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function DiscountCard({ discount }) {
  const [likes, setLikes] = useState(discount.likes || 0);
  const [dislikes, setDislikes] = useState(discount.dislikes || 0);
  const [voted, setVoted] = useState(false);
  const { user, toggleFavorite } = useAuth();

  const isFavorite = user?.favorites?.includes(discount._id || discount.externalId);

  const handleFavorite = () => {
    if (!user) return alert('Debes iniciar sesión para guardar favoritos');
    toggleFavorite(discount._id || discount.externalId);
  };

  const handleFeedback = async (type) => {
    if (voted) return;
    try {
      const id = discount._id || discount.externalId;
      const response = await fetch(`${API_URL}/api/discounts/${id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      if (response.ok) {
        const data = await response.json();
        setLikes(data.likes);
        setDislikes(data.dislikes);
        setVoted(true);
      }
    } catch (error) {
      console.error('Error sending feedback:', error);
    }
  };

  const trackingUrl = `${API_URL}/api/track/${discount._id || discount.externalId}`;

  return (
    <div className="group bg-white overflow-hidden shadow-sm rounded-2xl hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full relative">
      <button 
        onClick={handleFavorite}
        className="absolute top-3 left-3 z-10 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all"
      >
        <svg 
          className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
      <div className="relative h-48 overflow-hidden">
        <img 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" 
          src={discount.imageUrl || "https://via.placeholder.com/400x200?text=Oferta"} 
          alt={discount.title} 
        />
        <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 m-3 rounded-lg text-sm font-bold shadow-md">
          {discount.discountPercentage}% OFF
        </div>
        {discount.verified && (
          <div className="absolute bottom-0 left-0 bg-green-500 text-white px-3 py-1 m-3 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            Verificado
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center mb-2">
          <span className="text-xs font-bold tracking-wide uppercase text-secondary bg-blue-50 px-2 py-1 rounded">
            {discount.store?.name || discount.store_name || "Comercio"}
          </span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {discount.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-grow">
          {discount.description}
        </p>
        
        {/* Feedback Section */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
           <span className="text-xs font-bold">¿Funcionó?</span>
           <div className="flex gap-2">
             <button 
               onClick={() => handleFeedback('like')}
               disabled={voted}
               className={`flex items-center gap-1 px-2 py-1 rounded hover:bg-green-50 transition-colors ${voted ? 'opacity-50 cursor-not-allowed' : ''}`}
             >
               👍 {likes}
             </button>
             <button 
               onClick={() => handleFeedback('dislike')}
               disabled={voted}
               className={`flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition-colors ${voted ? 'opacity-50 cursor-not-allowed' : ''}`}
             >
               👎 {dislikes}
             </button>
           </div>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100">
          <a 
            href={trackingUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block w-full text-center bg-gray-900 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary transition-colors duration-300"
          >
            Ir a la Oferta
          </a>
        </div>
      </div>
    </div>
  );
}