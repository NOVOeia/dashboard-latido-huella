import React, { useState } from 'react';
import { Tag, Check, X, Loader2 } from 'lucide-react';
import { validateDiscountCode, DiscountCode } from '../utils/discounts';
interface DiscountCodeInputProps {
  onApply: (discount: DiscountCode | null) => void;
  disabled?: boolean;
}
export function DiscountCodeInput({
  onApply,
  disabled = false
}: DiscountCodeInputProps) {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(
    null
  );
  const handleApply = async () => {
    if (!code.trim()) return;
    setIsValidating(true);
    setError(null);
    const result = await validateDiscountCode(code);
    setIsValidating(false);
    if (result.valid && result.discount) {
      setAppliedDiscount(result.discount);
      onApply(result.discount);
    } else {
      setError(result.message || 'Código inválido');
      setAppliedDiscount(null);
      onApply(null);
    }
  };
  const handleRemove = () => {
    setCode('');
    setAppliedDiscount(null);
    setError(null);
    onApply(null);
  };
  if (appliedDiscount) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-green-100 p-1.5 rounded-full text-green-600">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-green-800">
              Código aplicado: {appliedDiscount.code}
            </p>
            <p className="text-xs text-green-600">
              {appliedDiscount.discount_type === 'percentage' ?
              `-${appliedDiscount.discount_value}% de descuento en el subtotal` :
              `-${(appliedDiscount.discount_value / 100).toLocaleString('es-CO')} COP de descuento`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          disabled={disabled}
          className="text-gray-400 hover:text-red-500 transition-colors p-1"
          title="Quitar código">
          
          <X className="w-5 h-5" />
        </button>
      </div>);

  }
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        ¿Tienes un código de descuento?
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Tag className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
            }}
            disabled={disabled || isValidating}
            placeholder="Ingresa tu código"
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-brand-cyan'} focus:ring-2 focus:border-transparent outline-none transition-all uppercase`}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleApply();
              }
            }} />
          
        </div>
        <button
          type="button"
          onClick={handleApply}
          disabled={!code.trim() || disabled || isValidating}
          className="bg-brand-navy hover:bg-[#1a2a8a] text-white px-4 py-2.5 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]">
          
          {isValidating ?
          <Loader2 className="w-5 h-5 animate-spin" /> :

          'Aplicar'
          }
        </button>
      </div>
      {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
    </div>);

}