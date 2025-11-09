import React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, XCircle, CheckCircle } from 'lucide-react';

interface ActionButtonsProps {
  isActive: boolean;
  onToggle: () => void;
  onEdit: () => void;
  activateText?: string;
  deactivateText?: string;
  showEditButton?: boolean;
}

/**
 * Standardized action buttons for manager pages
 * Matches Categories page button style:
 * - Deactivate: White background, red on hover
 * - Activate: White background, green on hover
 * - Edit: White background, yellow on hover
 */
export const ActionButtons: React.FC<ActionButtonsProps> = ({
  isActive,
  onToggle,
  onEdit,
  activateText = 'Activate',
  deactivateText = 'Deactivate',
  showEditButton = true,
}) => {
  return (
    <div className="flex justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className={`!bg-white !border-gray-300 transition-colors ${
          isActive 
            ? '!text-gray-900 hover:!bg-red-500 hover:!text-white hover:!border-red-500' 
            : '!text-gray-900 hover:!bg-green-400 hover:!text-black hover:!border-green-400'
        }`}
      >
        {isActive ? (
          <>
            <XCircle className="h-4 w-4 mr-1" />
            {deactivateText}
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4 mr-1" />
            {activateText}
          </>
        )}
      </Button>
      {showEditButton && (
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="!bg-white !border-gray-300 hover:!bg-yellow-400 hover:!border-yellow-500 transition-colors"
        >
          <Pencil className="h-4 w-4 !text-gray-900 hover:!text-black" />
        </Button>
      )}
    </div>
  );
};

export default ActionButtons;
