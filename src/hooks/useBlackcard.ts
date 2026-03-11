import { useState, useEffect, useCallback } from 'react';
import { blackCardService } from '../service/Blackcardservice';
import type { BlackCardMember } from '../interfaces/BlackCard';

interface UseBlackCardOptions {
  memberId: string;
  autoFetch?: boolean;
}

interface UseBlackCardReturn {
  member: BlackCardMember | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getGoogleWalletLink: () => Promise<string | null>;
  getAppleWalletUrl: () => string;
  getVCardUrl: () => string;
}

export const useBlackCard = ({
  memberId,
  autoFetch = true,
}: UseBlackCardOptions): UseBlackCardReturn => {
  const [member, setMember] = useState<BlackCardMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCardStatus = useCallback(async () => {
    if (!memberId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await blackCardService.getCardStatus(memberId);
      setMember(data);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Error al cargar la tarjeta';
      setError(message);
      setMember(null);
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    if (autoFetch && memberId) {
      fetchCardStatus();
    }
  }, [fetchCardStatus, autoFetch, memberId]);

  const getGoogleWalletLink = useCallback(async (): Promise<string | null> => {
    try {
      const response = await blackCardService.getGoogleWalletLink(memberId);
      return response.url;
    } catch (err) {
      console.error('Error obteniendo link de Google Wallet:', err);
      return null;
    }
  }, [memberId]);

  const getAppleWalletUrl = useCallback((): string => {
    return blackCardService.getAppleWalletUrl(memberId);
  }, [memberId]);

  const getVCardUrl = useCallback((): string => {
    return blackCardService.getVCardUrl(memberId);
  }, [memberId]);

  return {
    member,
    loading,
    error,
    refetch: fetchCardStatus,
    getGoogleWalletLink,
    getAppleWalletUrl,
    getVCardUrl,
  };
};