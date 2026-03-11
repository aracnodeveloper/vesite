import type { BlackCardMember, CardType } from '../../../interfaces/BlackCard';
import { CARD_THEMES } from '../../../interfaces/BlackCard';
import imgP from '../../../assets/img/visita_fill.svg';
import imgF from '../../../assets/img/VEWallet.png';

interface BlackCardDisplayProps {
  member: BlackCardMember;
}

const cardTypeLabel: Record<CardType, string> = {
  STANDARD: 'Standard',
  FOUNDER: 'Founder Edition',
  CORPORATE: 'Corporate',
  INFLUENCER: 'Influencer',
};

const BlackCardDisplay = ({ member }: BlackCardDisplayProps) => {
  const theme = CARD_THEMES[member.cardType];
  const isActive = member.isValid;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div
      className="relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden"
     style={{
  backgroundImage: `url(${imgF})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  aspectRatio: '1.586',
  boxShadow: `0 25px 60px ${theme.accent}30, 0 10px 20px rgba(0,0,0,0.5)`,
}}
    >
      {/* Efecto de brillo */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `radial-gradient(ellipse at 30% 20%, ${theme.accent}50, transparent 60%)`,
        }}
      />

      {/* Borde sutil dorado/acento */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          border: `1px solid ${theme.accent}25`,
        }}
      />

      <div className="relative h-full flex flex-col justify-between p-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <p
              className="text-xs font-medium tracking-[0.2em] uppercase"
              style={{ color: `${theme.accent}90` }}
            >
              VisitaEcuador.com
            </p>
            <h2
              className="text-md font-bold tracking-wider mt-0.5"
              style={{ color: theme.accent }}
            >
              BLACK CARD
            </h2>
          </div>

          {/* Badge de estado */}
          <div
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide hidden ${
              isActive
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : member.status === 'EXPIRED'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
            }`}
          >
            {isActive ? 'ACTIVA ✓' : member.status === 'EXPIRED' ? 'VENCIDA ✗' : 'INACTIVA'}
          </div>
        </div>

        {/* Center - Nombre del miembro */}
        <div className='w-full flex flex-wrap justify-center '>
          <div className=' -mt-7.5'>
            <p
              className="text-md font-semibold tracking-wide "
              style={{ color: theme.text }}
            >
              {member.name}
            </p>
         {/*   <p
              className="text-sm mt-0.5 hidden"
              style={{ color: `${theme.text}70` }}
            >
              {cardTypeLabel[member.cardType]}
            </p>
            </div>
            <div className='-mt-5 hidden'>
              <img src={imgP} alt="VisitaEcuador.com" className="w-12" />
*/}
            </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-end hidden">
          <div>
            <p
              className="text-[10px] tracking-wider"
              style={{ color: `${theme.text}50` }}
            >
              MEMBER ID
            </p>
            <p
              className="text-sm font-mono font-semibold mt-0.5"
              style={{ color: theme.accent }}
            >
              {member.memberId}
            </p>
          </div>
          <div className="text-right ">
            <p
              className="text-[10px] tracking-wider"
              style={{ color: `${theme.text}50` }}
            >
              VÁLIDA HASTA
            </p>
            <p
              className="text-sm font-medium mt-0.5"
              style={{ color: theme.text }}
            >
              {formatDate(member.expiresAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlackCardDisplay;