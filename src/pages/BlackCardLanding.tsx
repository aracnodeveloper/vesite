import { useParams } from 'react-router-dom';
import { useBlackCard } from '../hooks/useBlackcard';
import BlackCardDisplay from '../components/layers/BlackCard/BlackCardDisplay';
import WalletButtons from '../components/layers/BlackCard/WalletButtons';

const BlackCardLanding = () => {
  const { memberId } = useParams<{ memberId: string }>();

  const {
    member,
    loading,
    error,
    getGoogleWalletLink,
    getAppleWalletUrl,
    getVCardUrl,
  } = useBlackCard({ memberId: memberId || '' });

  // ========== LOADING ==========
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-amber-500/20 border-t-amber-500" />
          </div>
          <p className="text-gray-500 text-sm tracking-wide">Cargando tarjeta...</p>
        </div>
      </div>
    );
  }

  // ========== ERROR / NOT FOUND ==========
  if (error || !member) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-900 flex items-center justify-center border border-gray-800">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 15v2m0 0v2m0-2h2m-2 0H10m-4.93-4.93a8 8 0 1111.86 0" />
            </svg>
          </div>
          <h1 className="text-white text-2xl font-bold mb-3">
            Tarjeta no encontrada
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            El ID de miembro{' '}
            <span className="font-mono text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded">
              {memberId}
            </span>{' '}
            no existe o ha sido desactivado.
          </p>
        </div>
      </div>
    );
  }

  // ========== MAIN RENDER ==========
  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-4 py-12">

      {/* Logo / Header */}
      <div className="mb-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: '#D4AF37' }}
          />
          <h1
            className="text-xl font-bold tracking-[0.25em] uppercase"
            style={{ color: '#D4AF37' }}
          >
            VisitaEcuador
          </h1>
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: '#D4AF37' }}
          />
        </div>
        <p className="text-gray-600 text-xs tracking-[0.15em] uppercase">
          Black Card Member
        </p>
      </div>

      {/* Tarjeta visual */}
      <div className="mb-8 w-full max-w-sm">
        <BlackCardDisplay member={member} />
      </div>

      {/* Mensaje si está vencida o inactiva */}
      {!member.isValid && (
        <div className="mb-6 w-full max-w-sm">
          <div
            className={`rounded-xl px-5 py-4 text-center border ${
              member.status === 'EXPIRED'
                ? 'bg-red-950/30 border-red-900/50'
                : 'bg-gray-900/50 border-gray-800'
            }`}
          >
            <p className={`text-sm ${
              member.status === 'EXPIRED' ? 'text-red-400' : 'text-gray-400'
            }`}>
              {member.status === 'EXPIRED'
                ? 'Esta tarjeta ha expirado. Contacta a soporte para renovar tu membresía.'
                : 'Esta tarjeta se encuentra inactiva.'}
            </p>
          </div>
        </div>
      )}

      {/* Botones de Wallet - solo si activa */}
      {member.isValid && (
        <div className="w-full max-w-sm mb-8">
          <p className="text-gray-600 text-xs text-center mb-4 tracking-wide uppercase">
            Agrega tu tarjeta
          </p>
          <WalletButtons
            memberId={member.memberId}
            onGetGoogleLink={getGoogleWalletLink}
            appleWalletUrl={getAppleWalletUrl()}
            vCardUrl={getVCardUrl()}
          />
        </div>
      )}

      {/* QR Info */}
      <div className="mt-4 text-center">
        <p className="text-gray-700 text-[10px] tracking-wider uppercase">
          El QR de tu tarjeta siempre apunta a esta página
        </p>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-12 text-center">
        <div className="w-12 h-px bg-gray-800 mx-auto mb-4" />
        <p className="text-gray-800 text-[10px] tracking-wider">
          © {new Date().getFullYear()} VisitaEcuador.com
        </p>
      </div>
    </div>
  );
};

export default BlackCardLanding;