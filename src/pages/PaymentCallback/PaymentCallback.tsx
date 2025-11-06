import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { orderPaymentService } from '@/services/orderPaymentService';
import { APP_ROUTES } from '@/routes/route.constants';

const PaymentCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing payment...');
  const [orderInfo, setOrderInfo] = useState<{
    orderId?: string;
    amount?: string;
    transactionNo?: string;
  }>({});

  useEffect(() => {
    const processPayment = async () => {
      try {
        console.log('=== VNPay Payment Callback ===');
        
        // Convert URL search params to object
        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          params[key] = value;
        });

        console.log('VNPay Params:', params);
        console.log('Order ID:', params.orderId);
        console.log('Response Code:', params.vnp_ResponseCode);
        console.log('Transaction Status:', params.vnp_TransactionStatus);

        // Store order info for display
        setOrderInfo({
          orderId: params.orderId,
          amount: params.vnp_Amount ? (parseInt(params.vnp_Amount) / 100).toString() : '0',
          transactionNo: params.vnp_TransactionNo,
        });

        // Check VNPay response code (00 = success)
        const isSuccess = params.vnp_ResponseCode === '00' && params.vnp_TransactionStatus === '00';

        if (!isSuccess) {
          setStatus('error');
          setMessage(getVNPayErrorMessage(params.vnp_ResponseCode));
          return;
        }

        // Call VNPay callback API to verify and update order
        console.log('Sending callback to backend...');
        const response = await orderPaymentService.vnpayCallback(params);
        
        console.log('Callback Response:', response);

        setStatus('success');
        setMessage(response.message || 'Payment successful! Your order has been confirmed.');

        // Redirect to order history after 3 seconds
        setTimeout(() => {
          navigate(APP_ROUTES.ORDER_HISTORY || '/orders/history', { replace: true });
        }, 3000);
      } catch (error: any) {
        console.error('=== Payment Callback Error ===');
        console.error('Error:', error);
        console.error('Error Response:', error.response?.data);
        
        setStatus('error');
        setMessage(
          error.response?.data?.message || 
          'Payment verification failed. Please contact support if amount was deducted.'
        );
      }
    };

    processPayment();
  }, [searchParams, navigate]);

  // Helper function to get VNPay error message
  const getVNPayErrorMessage = (responseCode: string): string => {
    const errorMessages: Record<string, string> = {
      '07': 'Transaction is suspected of fraud',
      '09': 'Transaction failed: Card not registered for Internet Banking',
      '10': 'Transaction failed: Incorrect authentication more than 3 times',
      '11': 'Transaction failed: Payment timeout',
      '12': 'Transaction failed: Card is locked',
      '13': 'Transaction failed: Invalid OTP',
      '24': 'Transaction cancelled by user',
      '51': 'Transaction failed: Insufficient balance',
      '65': 'Transaction failed: Daily transaction limit exceeded',
      '75': 'Payment gateway is under maintenance',
      '79': 'Transaction failed: Incorrect payment password more than allowed',
      '99': 'Unknown error occurred',
    };

    return errorMessages[responseCode] || `Payment failed with code: ${responseCode}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {status === 'processing' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-4">
              <svg
                className="animate-spin h-10 w-10 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Processing Payment</h2>
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            
            {/* Order Details */}
            {orderInfo.orderId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-800 mb-2">Order Details</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium">#{orderInfo.orderId}</span>
                  </div>
                  {orderInfo.amount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">
                        {parseInt(orderInfo.amount).toLocaleString('vi-VN')} ₫
                      </span>
                    </div>
                  )}
                  {orderInfo.transactionNo && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction No:</span>
                      <span className="font-medium">{orderInfo.transactionNo}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <button
              onClick={() => navigate(APP_ROUTES.ORDER_HISTORY, { replace: true })}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition mb-2"
            >
              View Order History
            </button>
            <p className="text-sm text-gray-500">Auto-redirecting in 3 seconds...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-4">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate(APP_ROUTES.CART)}
                className="w-full px-6 py-3 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition"
              >
                Back to Cart
              </button>
              <button
                onClick={() => navigate(APP_ROUTES.HOME)}
                className="w-full px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-full hover:bg-gray-300 transition"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentCallbackPage;
