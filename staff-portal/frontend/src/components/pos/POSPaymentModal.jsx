import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../../services/api';
import { X, CreditCard, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

const CheckoutForm = ({ amount, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);
    try {
      // 1. Create Payment Intent
      const { data } = await api.post('/payments/create-intent', { amount });
      const clientSecret = data.data.clientSecret;

      // 2. Confirm Card Payment
      const payload = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (payload.error) {
        setError(payload.error.message);
        setProcessing(false);
      } else {
        setSuccess(true);
        // Delay closing/success callback to show the success state briefly
        setTimeout(() => {
          onPaymentSuccess(payload.paymentIntent.id);
        }, 1500);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'An error occurred during payment processing.';
      setError(errorMessage);
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <CheckCircle className="w-16 h-16 text-green-600 mb-4 animate-in zoom-in" />
        <h3 className="text-xl font-bold text-slate-800 mb-1">Payment Successful!</h3>
        <p className="text-slate-500">Generating receipt...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-[8px]">
        <label className="block text-[14px] font-medium text-slate-700 mb-2">Card Details</label>
        <div className="bg-white p-3 border border-slate-300 rounded-[4px] shadow-sm">
          <CardElement options={{
            style: {
              base: { fontSize: '16px', color: '#1e293b', '::placeholder': { color: '#94a3b8' } },
              invalid: { color: '#dc2626' },
            },
          }} />
        </div>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-[4px] flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2 shrink-0 mt-0.5" />
          <p className="text-red-700 text-[14px]">{error}</p>
        </div>
      )}
      
      <button
        disabled={processing || !stripe}
        type="submit"
        className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-[8px] font-semibold text-[16px] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? (
          <>
            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Pay Rs. {amount.toLocaleString()}
          </>
        )}
      </button>
    </form>
  );
};

const POSPaymentModal = ({ isOpen, onClose, amount, cart, customer, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processingCash, setProcessingCash] = useState(false);

  if (!isOpen) return null;

  const handleCashPayment = async () => {
    setProcessingCash(true);
    try {
      const items = cart.map(item => ({
        productId: item.product._id,
        quantity: item.quantity
      }));

      const payload = {
        items,
        customerId: customer && !customer.isWalkIn ? customer._id : null,
        walkInCustomerName: customer?.isWalkIn ? customer.name : null,
        walkInCustomerPhone: customer?.isWalkIn ? customer.phone : null,
        subtotal: amount,
        total: amount,
        paymentStatus: 'paid' // Implicitly cash since stripePaymentIntentId is missing
      };

      const { data } = await api.post('/sales', payload);
      onSuccess(data.data);
    } catch (error) {
      alert('Failed to record cash sale in ERP. Please contact admin.');
    } finally {
      setProcessingCash(false);
    }
  };

  const handleStripeSuccess = async (stripePaymentIntentId) => {
    try {
      const items = cart.map(item => ({
        productId: item.product._id,
        quantity: item.quantity
      }));

      const payload = {
        items,
        customerId: customer && !customer.isWalkIn ? customer._id : null,
        walkInCustomerName: customer?.isWalkIn ? customer.name : null,
        walkInCustomerPhone: customer?.isWalkIn ? customer.phone : null,
        subtotal: amount,
        total: amount,
        paymentStatus: 'paid',
        stripePaymentIntentId
      };

      const { data } = await api.post('/sales', payload);
      onSuccess(data.data);
    } catch (error) {
      alert('Payment succeeded, but failed to record sale in ERP. Please contact admin.');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-200 rounded-[12px] w-full max-w-md shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-[18px] font-bold text-slate-800">Complete Payment</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 flex flex-col items-center justify-center py-4 bg-slate-50 border border-slate-200 rounded-[8px]">
            <span className="text-slate-500 text-[14px] font-medium uppercase tracking-wider mb-1">Total to Pay</span>
            <span className="text-[32px] font-extrabold text-slate-800">
              <span className="text-[20px] text-slate-500 mr-1">Rs.</span>
              {amount.toLocaleString()}
            </span>
          </div>

          <div className="mb-6 flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-[8px]">
            <div className="flex flex-col">
              <span className="text-[12px] text-blue-600 font-semibold uppercase tracking-wide">Customer</span>
              <span className="text-[14px] font-bold text-slate-800">
                {customer?.name || 'Walk-in Customer'}
              </span>
            </div>
            {customer?.phone && (
              <span className="text-[14px] text-slate-600">{customer.phone}</span>
            )}
          </div>

          <div className="mb-6">
            <div className="flex bg-slate-100 p-1 rounded-lg w-full mb-4">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 flex justify-center items-center py-2 rounded-md text-[14px] font-medium transition-colors ${
                  paymentMethod === 'card' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                }`}
              >
                Card (Stripe)
              </button>
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`flex-1 flex justify-center items-center py-2 rounded-md text-[14px] font-medium transition-colors ${
                  paymentMethod === 'cash' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                }`}
              >
                Cash
              </button>
            </div>

            {paymentMethod === 'card' ? (
              stripePromise ? (
                <Elements stripe={stripePromise}>
                  <CheckoutForm amount={amount} onPaymentSuccess={handleStripeSuccess} />
                </Elements>
              ) : (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-[8px] text-[14px] text-center flex items-start">
                  <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                  <span>Stripe is not configured. Add VITE_STRIPE_PUBLISHABLE_KEY to your .env file to enable card payments.</span>
                </div>
              )
            ) : (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 p-4 rounded-[8px] text-center">
                  <p className="text-green-800 text-[14px] font-medium mb-1">Cash Payment Selected</p>
                  <p className="text-green-700 text-[12px]">Please collect Rs. {amount.toLocaleString()} from the customer.</p>
                </div>
                <button
                  onClick={handleCashPayment}
                  disabled={processingCash}
                  className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-4 rounded-[8px] font-semibold text-[16px] transition-colors shadow-sm disabled:opacity-50"
                >
                  {processingCash ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Mark as Paid (Cash)
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSPaymentModal;
