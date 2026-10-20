export type CardType = 'STANDARD' | 'FOUNDER' | 'CORPORATE' | 'INFLUENCER';
export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';

/** Respuesta del endpoint público /blackcard/:memberId */
export interface BlackCardMember {
  memberId: string;
  name: string;
  email: string;
  phone?: string;
  cardType: CardType;
  status: MemberStatus;
  activatedAt: string;
  expiresAt: string;
  isValid: boolean;
}

/** Respuesta completa del endpoint admin /members/:memberId */
export interface BlackCardFullMember extends BlackCardMember {
  id: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Payload para crear miembro */
export interface CreateMemberPayload {
  name: string;
  email: string;
  phone?: string;
  cardType?: CardType;
  userId?: string;
  activatedAt?: string;
}

/** Payload para actualizar miembro */
export interface UpdateMemberPayload extends Partial<CreateMemberPayload> {
  status?: MemberStatus;
}

/** Respuesta paginada de /members */
export interface MemberListResponse {
  data: BlackCardFullMember[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

/** Respuesta del endpoint Google Wallet */
export interface WalletLinkResponse {
  url: string;
}

/** Colores por tipo de tarjeta */
export const CARD_THEMES: Record<CardType, { bg: string; accent: string; text: string }> = {
  STANDARD:   { bg: '#000000', accent: '#D4AF37', text: '#FFFFFF' },
  FOUNDER:    { bg: '#0A0A0A', accent: '#2D8C3C', text: '#FFFFFF' },
  CORPORATE:  { bg: '#111111', accent: '#C0C0C0', text: '#FFFFFF' },
  INFLUENCER: { bg: '#0D0D0D', accent: '#E040FB', text: '#FFFFFF' },
};