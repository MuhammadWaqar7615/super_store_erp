import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '../context/AuthContext';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx');

import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CheckoutForm = ({ clientSecret, paymentIntentId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders`,
      },
      redirect: 'if_required'
    });

    if (stripeError) {
      setError(stripeError.message);
      setProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment succeeded
      navigate('/orders', { state: { justPaid: true } });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement onReady={() => setIsReady(true)} />
      {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
      
      <button 
        disabled={!stripe || !isReady || processing} 
        className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {processing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

const Checkout = () => {
  const { customer } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { clientSecret, paymentIntentId } = location.state || {};

  useEffect(() => {
    if (!customer || !clientSecret) {
      navigate('/cart');
    }
  }, [customer, clientSecret, navigate]);

  if (!clientSecret) return null;

  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#2563eb',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Complete Payment</h2>
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm clientSecret={clientSecret} paymentIntentId={paymentIntentId} />
        </Elements>
      </div>
    </div>
  );
};

export default Checkout;
