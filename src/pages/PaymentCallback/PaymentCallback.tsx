import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { orderPaymentService, type MoMoCallbackPayload } from '@/services/orderPaymentService';
import { APP_ROUTES } from '@/routes/route.constants';

const PaymentCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Đang xử lý thanh toán...');
  const [orderInfo, setOrderInfo] = useState<{
    orderId?: string;
    amount?: string;
    transactionNo?: string;
  }>({});
  const [mounted, setMounted] = useState(false);

  // Debug: Log component mount
  useEffect(() => {
    console.log('🎯 PaymentCallbackPage mounted');
    setMounted(true);
  }, []);

  useEffect(() => {
    const processPayment = async () => {
      try {
        console.log('💰 Starting payment processing...');
        
        // Convert URL search params to object
        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          params[key] = value;
        });

        // Detect payment gateway based on params
        const isMoMo = params.partnerCode === 'MOMO' || params.resultCode !== undefined;
        const isVNPay = params.vnp_ResponseCode !== undefined;

        console.log('=== Payment Callback Debug ===');
        console.log('Gateway:', isMoMo ? '🟣 MoMo' : isVNPay ? '🔵 VNPay' : '❓ Unknown');
        console.log('All Params:', params);
        console.log('Is MoMo?', isMoMo);
        console.log('Is VNPay?', isVNPay);

        if (isMoMo) {
          // MoMo payment processing
          console.log('🟣 === MoMo Payment Processing ===');
          console.log('Raw URL Params:', params);

          // Convert MoMo params to proper JSON format (amount and responseTime should be numbers)
          const momoPayload: MoMoCallbackPayload = {
            partnerCode: params.partnerCode || 'MOMO',
            orderId: params.orderId || '',
            requestId: params.requestId || '',
            amount: parseInt(params.amount || '0', 10),
            orderInfo: params.orderInfo || '',
            orderType: params.orderType || '',
            transId: params.transId || '',
            resultCode: params.resultCode || '',
            message: params.message || '',
            payType: params.payType || '',
            responseTime: parseInt(params.responseTime || '0', 10),
            extraData: params.extraData || '',
            signature: params.signature || '',
          };

          console.log('🟣 Converted MoMo Payload:', momoPayload);
          console.log('Order ID:', momoPayload.orderId);
          console.log('Result Code:', momoPayload.resultCode);
          console.log('Amount:', momoPayload.amount, '(type:', typeof momoPayload.amount, ')');
          console.log('Trans ID:', momoPayload.transId);
          console.log('Message:', decodeURIComponent(momoPayload.message));

          // Store order info for display
          const numericOrderId = momoPayload.orderId?.includes('-') 
            ? momoPayload.orderId.split('-').pop() 
            : momoPayload.orderId;
          
          console.log('Extracted Order ID:', numericOrderId);
          
          setOrderInfo({
            orderId: numericOrderId,
            amount: momoPayload.amount.toString(),
            transactionNo: momoPayload.transId,
          });

          // Check MoMo result code (0 = success)
          const isSuccess = momoPayload.resultCode === '0';
          console.log('Is Success?', isSuccess, '(resultCode:', momoPayload.resultCode, ')');

          if (!isSuccess) {
            console.log('❌ MoMo payment failed');
            setStatus('error');
            setMessage(getMoMoErrorMessage(momoPayload.resultCode, decodeURIComponent(momoPayload.message)));
            return;
          }

          // Call MoMo callback API to verify and update order
          console.log('📡 Sending MoMo callback to backend for verification...');
          const response = await orderPaymentService.momoCallback(momoPayload);
          
          console.log('✅ MoMo Callback Response:', response);

          setStatus('success');
          setMessage(response.message || decodeURIComponent(params.message) || 'Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.');
          
          console.log('✅ MoMo payment processed successfully');

        } else if (isVNPay) {
          // VNPay payment processing
          console.log('🔵 === VNPay Payment Processing ===');
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
          console.log('Is Success?', isSuccess);

          if (!isSuccess) {
            console.log('❌ VNPay payment failed');
            setStatus('error');
            setMessage(getVNPayErrorMessage(params.vnp_ResponseCode));
            return;
          }

          // Call VNPay callback API to verify and update order
          console.log('📡 Sending VNPay callback to backend...');
          const response = await orderPaymentService.vnpayCallback(params);
          
          console.log('✅ VNPay Callback Response:', response);

          setStatus('success');
          setMessage(response.message || 'Payment successful! Your order has been confirmed.');
          
          console.log('✅ VNPay payment processed successfully');
        } else {
          console.error('❌ Unknown payment gateway - no valid params detected');
          throw new Error('Unknown payment gateway');
        }

        // Redirect to order history after 3 seconds
        console.log('⏰ Setting up auto-redirect in 3 seconds...');
        setTimeout(() => {
          console.log('🔄 Redirecting to order history...');
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

  // Helper function to get MoMo error message
  const getMoMoErrorMessage = (resultCode: string, message?: string): string => {
    const errorMessages: Record<string, string> = {
      '9000': 'Transaction được khởi tạo thành công nhưng chưa hoàn tất',
      '1000': 'Transaction đã được gửi nhưng chưa nhận được phản hồi',
      '8000': 'Transaction đã timeout',
      '7000': 'Giao dịch bị từ chối bởi người dùng',
      '1001': 'Transaction thất bại do lỗi',
      '1002': 'Transaction bị từ chối do số dư không đủ',
      '1003': 'Transaction bị từ chối do vượt quá số lần thanh toán trong ngày',
      '1004': 'Transaction bị từ chối do vượt quá số tiền thanh toán trong ngày',
      '1005': 'Transaction bị từ chối do URL không hợp lệ',
      '1006': 'Transaction bị từ chối do không tìm thấy người dùng',
      '1007': 'Transaction bị từ chối do lỗi xác thực',
      '9': 'Merchant refused transaction',
      '10': 'Khách hàng đã hủy giao dịch',
      '11': 'Transaction timeout - Khách hàng không hoàn thành thanh toán',
      '12': 'Khách hàng đã hủy giao dịch',
      '13': 'Khách hàng nhập sai mật khẩu thanh toán quá số lần quy định',
      '20': 'Insufficient balance',
      '21': 'Invalid amount',
      '22': 'Invalid transaction info',
      '40': 'RequestId đã tồn tại',
      '41': 'OrderId đã tồn tại',
      '42': 'OrderId không hợp lệ hoặc không được tìm thấy',
      '43': 'Request bị trùng (requestId và orderId đã được sử dụng)',
      '99': 'Lỗi không xác định',
    };

    return errorMessages[resultCode] || message || `Payment failed with code: ${resultCode}`;
  };

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center px-4 py-8">
      {/* Fallback for unmounted state */}
      {!mounted && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      )}
      
      {mounted && (
        <div className="max-w-md w-full">
          {/* Debug Info - Remove in production */}
          <div className="mb-4 p-3 bg-gray-800 text-white text-xs rounded-lg overflow-auto max-h-32">
            <div>Status: {status}</div>
            <div>Gateway: {searchParams.get('partnerCode') || searchParams.get('vnp_ResponseCode') ? 'detected' : 'unknown'}</div>
            <div>MoMo resultCode: {searchParams.get('resultCode') || 'N/A'}</div>
            <div>VNPay responseCode: {searchParams.get('vnp_ResponseCode') || 'N/A'}</div>
            <div>Mounted: {mounted ? 'Yes' : 'No'}</div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
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
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Đang xử lý</h2>
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
            <h2 className="text-2xl font-bold text-green-600 mb-2">Thanh toán thành công!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            
            {/* Order Details */}
            {orderInfo.orderId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-800 mb-2">Thông tin đơn hàng</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã đơn hàng:</span>
                    <span className="font-medium">#{orderInfo.orderId}</span>
                  </div>
                  {orderInfo.amount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số tiền:</span>
                      <span className="font-medium">
                        {parseInt(orderInfo.amount).toLocaleString('vi-VN')} ₫
                      </span>
                    </div>
                  )}
                  {orderInfo.transactionNo && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mã giao dịch:</span>
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
              Xem lịch sử đơn hàng
            </button>
            <p className="text-sm text-gray-500">Tự động chuyển trang sau 3 giây...</p>
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
            <h2 className="text-2xl font-bold text-red-600 mb-2">Thanh toán thất bại</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate(APP_ROUTES.CART)}
                className="w-full px-6 py-3 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition"
              >
                Quay lại giỏ hàng
              </button>
              <button
                onClick={() => navigate(APP_ROUTES.HOME)}
                className="w-full px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-full hover:bg-gray-300 transition"
              >
                Về trang chủ
              </button>
            </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentCallbackPage;
