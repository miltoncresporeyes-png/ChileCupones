import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DiscountCard from '../components/DiscountCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Home() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBank, setSelectedBank] = useState('Todos');

  useEffect(() => {
    // Fetch discounts from backend
    // For now, we can mock if backend is not ready or empty
    const fetchDiscounts = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/discounts`);
        setDiscounts(response.data);
      } catch (error) {
        console.error("Error fetching discounts", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscounts();
  }, []);

  // Extract unique payment methods
  const banks = ['Todos', ...new Set(discounts.map(d => d.paymentMethod).filter(Boolean))];

  // Filter discounts
  const filteredDiscounts = selectedBank === 'Todos' 
    ? discounts 
    : discounts.filter(d => d.paymentMethod === selectedBank);

  const handleCrawl = async () => {
    if (!window.confirm('¿Estás seguro de actualizar los datos? Esto puede tardar unos segundos.')) return;
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/crawl`);
      const response = await axios.get(`${API_URL}/api/discounts`);
      setDiscounts(response.data);
      alert('Datos actualizados correctamente');
    } catch (error) {
      console.error("Error crawling", error);
      alert('Error al actualizar datos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-20 px-4 sm:px-6 lg:px-8 mb-10 shadow-xl">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl sm:tracking-tight lg:text-6xl mb-4 font-sans">
            Ahorra en tus marcas favoritas
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-white/90 font-light">
            Encuentra los mejores descuentos validados para tus tarjetas y ubicación.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {banks.map(bank => (
            <button
              key={bank}
              onClick={() => setSelectedBank(bank)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-200 transform hover:scale-105
                ${selectedBank === bank 
                  ? 'bg-secondary text-white shadow-lg ring-2 ring-offset-2 ring-secondary' 
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 shadow-sm'}`}
            >
              {bank}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {filteredDiscounts.map((discount) => (
              <DiscountCard key={discount._id || discount.externalId} discount={discount} />
            ))}
          </div>
        )}

        <div className="mt-12 text-center border-t border-gray-200 pt-8">
          <button 
            onClick={handleCrawl}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Admin: Actualizar Datos (Crawler)
          </button>
        </div>
      </div>
    </div>
  );
}
