import apiService from './apiService';
import api from './api';
import {
  blackCardApi,
  membersApi,
  googleWalletApi,
  appleWalletApi,
  contactVcardApi,
  memberByUserApi
} from '../constants/EndpointsRoutes';
import type {
  BlackCardMember,
  BlackCardFullMember,
  CreateMemberPayload,
  UpdateMemberPayload,
  MemberListResponse,
  WalletLinkResponse,
} from '../interfaces/BlackCard';

export const blackCardService = {

  // ==================== PÚBLICOS (sin auth) ====================

  /** Estado de la tarjeta — landing pública */
  async getCardStatus(memberId: string): Promise<BlackCardMember> {
    return apiService.getAll<BlackCardMember>(`${blackCardApi}/${memberId}`);
  },

  /** URL de Google Wallet */
  async getGoogleWalletLink(memberId: string): Promise<WalletLinkResponse> {
    return apiService.getAll<WalletLinkResponse>(`${googleWalletApi}/${memberId}`);
  },

  /** URL directa para descargar Apple Wallet .pkpass */
  getAppleWalletUrl(memberId: string): string {
    return `${api.defaults.baseURL}${appleWalletApi}/${memberId}.pkpass`;
  },

  /** URL directa para descargar vCard .vcf */
  getVCardUrl(memberId: string): string {
    return `${api.defaults.baseURL}${contactVcardApi}/${memberId}.vcf`;
  },
  async getMemberByUserId(userId: string): Promise<BlackCardFullMember> {
  return apiService.getAll<BlackCardFullMember>(`${memberByUserApi}/${userId}`);
},

  // ==================== ADMIN (con auth) ====================

  /** Listar miembros paginados */
  async listMembers(page = 1, size = 20): Promise<MemberListResponse> {
    return apiService.getAll<MemberListResponse>(
      `${membersApi}?page=${page}&size=${size}`
    );
  },

  /** Obtener miembro por member_id */
  async getMember(memberId: string): Promise<BlackCardFullMember> {
    return apiService.getAll<BlackCardFullMember>(`${membersApi}/${memberId}`);
  },

  /** Crear nuevo miembro */
  async createMember(data: CreateMemberPayload): Promise<BlackCardFullMember> {
    return apiService.create<CreateMemberPayload, BlackCardFullMember>(
      membersApi,
      data
    );
  },

  /** Actualizar miembro */
  async updateMember(memberId: string, data: UpdateMemberPayload): Promise<BlackCardFullMember> {
    return apiService.patch<BlackCardFullMember>(
      `${membersApi}/${memberId}`,
      data as BlackCardFullMember
    );
  },

  /** Desactivar miembro */
  async deactivateMember(memberId: string): Promise<BlackCardFullMember> {
    return apiService.patch<BlackCardFullMember>(
      `${membersApi}/${memberId}/deactivate`,
      {} as BlackCardFullMember
    );
  },

  /** Reactivar miembro (renueva 12 meses) */
  async reactivateMember(memberId: string): Promise<BlackCardFullMember> {
    return apiService.patch<BlackCardFullMember>(
      `${membersApi}/${memberId}/reactivate`,
      {} as BlackCardFullMember
    );
  },
};