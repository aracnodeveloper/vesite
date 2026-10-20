import React from 'react';
import { Info } from 'lucide-react';

interface AdminLinkToggleProps {
    isSelected: boolean;
    onToggle: (value: boolean) => void;
    disabled?: boolean;
    label?: string;
    description?: string;
}

const AdminLinkToggle = ({
                             isSelected,
                             onToggle,
                             disabled = false,
                             label = "Aplicar a sitios hijos",
                             description = "Si está activado, este enlace aparecerá en todos los biosites de tus usuarios y no podrán editarlo ni eliminarlo."
                         }: AdminLinkToggleProps) => {

    // Add this debug log
    console.log('AdminLinkToggle rendered with isSelected:', isSelected);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                    <span>{label}</span>
                    <div className="relative group">
                        <Info size={14} className="text-gray-400 cursor-help" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-64 text-center z-50">
                            {description}
                        </div>
                    </div>
                </label>
                <div
                    className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors ${
                        isSelected
                            ? 'bg-blue-600'
                            : 'bg-gray-200'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => {
                        console.log('Toggle clicked. Current isSelected:', isSelected, 'Will toggle to:', !isSelected);
                        !disabled && onToggle(!isSelected);
                    }}
                >
          <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isSelected ? 'translate-x-6' : 'translate-x-1'
              }`}
          />
                </div>
            </div>

            {/* Info message */}
            <div className={`text-xs p-2 rounded-md border ${
                isSelected
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}>
                {isSelected
                    ? "✓ Este enlace será aplicado a todos los biosites de tus usuarios de forma automática"
                    : "○ Este enlace solo aparecerá en tu biosite personal"
                }
            </div>
        </div>
    );
};
export default AdminLinkToggle;