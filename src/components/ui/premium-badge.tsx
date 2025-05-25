
export const PremiumBadge = () => {
  return (
    <div className="inline-flex flex-col items-center">
      <span className="text-white font-light text-lg tracking-wide">
        Vade Mecum
      </span>
      <span 
        className="text-amber-400 font-bold text-xl tracking-wider"
        style={{ 
          fontFamily: 'Georgia, "Times New Roman", serif',
          textShadow: '0 2px 4px rgba(251, 191, 36, 0.3)'
        }}
      >
        Premium 2025
      </span>
    </div>
  );
};
