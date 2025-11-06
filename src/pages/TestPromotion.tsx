import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { promotionService } from '@/services/promotionService';

export const TestPromotion: React.FC = () => {
  const { data: promotions, isLoading, error } = useQuery({
    queryKey: ['promotions', 'public'],
    queryFn: () => promotionService.getAllPublic(),
  });

  console.log('Test Promotion Page');
  console.log('Promotions:', promotions);
  console.log('Loading:', isLoading);
  console.log('Error:', error);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Promotion API</h1>
      
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-600">Error: {JSON.stringify(error)}</p>}
      
      <div className="mt-4">
        <h2 className="font-bold mb-2">Promotions ({promotions?.length || 0}):</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(promotions, null, 2)}
        </pre>
      </div>
    </div>
  );
};
