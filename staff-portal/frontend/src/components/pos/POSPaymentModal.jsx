import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../../services/api';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) 
  : null;

const CheckoutForm = ({ amount, onPaymentSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    try {
      const { data } = await api.post('/payments/create-intent', { amount });
      const clientSecret = data.data.clientSecret;

      const payload = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (payload.error) {
        setError(`Payment failed: ${payload.error.message}`);
        setProcessing(false);
      } else {
        onPaymentSuccess('STRIPE', payload.paymentIntent.id);
      }
    } catch (err) {
      setError('An error occurred during payment processing.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-white p-4 rounded-xl shadow-inner">
        <CardElement options={{
          style: {
            base: { fontSize: '16px', color: '#424770', '::placeholder': { color: '#aab7c4' } },
            invalid: { color: '#9e2146' },
          },
        }} />
      </div>
      {error && <div className="text-red-400 text-sm">{error}</div>}
      <button 
        disabled={processing || !stripe} 
        type="submit"
        className="w-full bg-[#6C3CE1] hover:bg-[#5b32bf] text-white py-3 rounded-xl font-bold shadow-lg transition-all disabled:opacity-50"
      >
        {processing ? 'Processing...' : `Pay Rs. ${amount}`}
      </button>
    </form>
  );
};

const POSPaymentModal = ({ isOpen, onClose, amount, cart, customer, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('CASH'); // CASH or STRIPE
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCashPayment = async () => {
    setLoading(true);
    try {
      const items = cart.map(item => ({
        productId: item.product._id,
        quantity: item.quantity
      }));
      
      const payload = {
        items,
        customerId: customer?._id || null,
        subtotal: amount,
        total: amount,
        paymentStatus: 'PAID'
      };

      const { data } = await api.post('/sales', payload);
      onSuccess(data.data);
    } catch (error) {
      alert('Failed to process sale');
    } finally {
      setLoading(false);
    }
  };

  const handleStripeSuccess = async (method, stripePaymentIntentId) => {
    try {
      const items = cart.map(item => ({
        productId: item.product._id,
        quantity: item.quantity
      }));
      
      const payload = {
        items,
        customerId: customer?._id || null,
        subtotal: amount,
        total: amount,
        paymentStatus: 'PAID',
        stripePaymentIntentId
      };

      const { data } = await api.post('/sales', payload);
      onSuccess(data.data);
    } catch (error) {
      alert('Failed to record sale after payment');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="bg-[#1B2A4A] border border-white/20 rounded-3xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
        <h2 className="text-2xl font-bold text-white mb-6">Complete Payment</h2>
        
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center mb-6">
          <span className="text-gray-400">Total Amount</span>
          <span className="text-3xl font-extrabold text-[#E8446A]">Rs. {amount}</span>
        </div>

        <div className="flex space-x-4 mb-6">
          <button 
            onClick={() => setPaymentMethod('CASH')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${paymentMethod === 'CASH' ? 'bg-[#E8446A] text-white shadow-[0_0_15px_rgba(232,68,106,0.4)]' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
          >
            Cash
          </button>
          <button 
            onClick={() => setPaymentMethod('STRIPE')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${paymentMethod === 'STRIPE' ? 'bg-[#6C3CE1] text-white shadow-[0_0_15px_rgba(108,60,225,0.4)]' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
          >
            Credit Card
          </button>
        </div>

        {paymentMethod === 'CASH' ? (
          <div className="space-y-4">
            <button 
              onClick={handleCashPayment}
              disabled={loading}
              className="w-full bg-[#E8446A] hover:bg-[#d4375b] text-white py-3 rounded-xl font-bold shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm Cash Payment'}
            </button>
          </div>
        ) : (
          <div>
            {stripePromise ? (
              <Elements stripe={stripePromise}>
                <CheckoutForm amount={amount} onPaymentSuccess={handleStripeSuccess} onCancel={onClose} />
              </Elements>
            ) : (
              <div className="bg-yellow-500/20 text-yellow-200 p-4 rounded-xl text-sm text-center">
                Stripe is not configured. Add VITE_STRIPE_PUBLISHABLE_KEY to your .env file to enable card payments.
              </div>
            )}
          </div>
        )}

        <button 
          onClick={onClose}
          className="w-full mt-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 transition-all font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default POSPaymentModal;
