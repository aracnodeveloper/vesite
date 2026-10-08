// AUTH
export const loginApi = "/auth/login-flexible";
export const registerApi = "/auth/register";

// USERS
export const usersApi = "/users";

// BIOSITES
export const biositesApi = "/biosites";
export const allBiositesApi = "/biosites?page=10&size=10";
export const biositesByUserApi = "/biosites/user";   // GET /:userId
export const biositesByAdminApi = "/biosites/admin"; // GET /:adminId · PATCH /update-*/:adminId
export const biositeBySlugApi = "/biosites/slug";    // GET /:slug
export const biositeAnalyticsApi = "/biosites/analytics"; // GET /:userId

// PLANTILLAS
export const plantillasApi = "/plantillas";

// LINKS
export const linksApi = "/links";
export const linksByBiositeApi = "/links/biosite"; // GET /:biositeId
export const reorderLinksApi = "/links/reorder";   // PATCH /:biositeId

// SECTIONS
export const sectionsApi = "/section";
export const sectionsByBiositeApi = "/section/biosite"; // GET /:biositeId
export const reorderSectionsApi = "/section/reorder";   // PATCH /:biositeId

// TEXT BLOCKS (galería)
export const textBlocksApi = "/texts-blocks";
export const textBlocksByBiositeApi = "/texts-blocks/biosite"; // GET /:biositeId

// UPLOADS
export const uploadImageApi = "/upload/image";
export const uploadBiositeAvatarApi = "/upload/biosite-avatar";         // POST /:biositeId
export const uploadBiositeBackgroundApi = "/upload/biosite-background"; // POST /:biositeId
export const linkImageApi = "/upload/image-link";                       // POST /:linkId
export const blockImageApi = "/upload/image-block";                     // POST /:blockId

// BUSINESS CARDS (V-Card)
export const businessCardsApi = "/business-cards";
export const createBusinessCardApi = "/business-cards"; // POST /:userId
export const getBusinessCardApi = "/business-cards"; // GET /:id
export const getBusinessCardByUserApi = "/business-cards/user"; // GET /user/:userId
export const getBusinessCardBySlugApi = "/business-cards/by-slug"; // GET /by-slug/:slug
export const regenerateQRCodeApi = "/business-cards/regenerate-qr"; // POST /regenerate-qr/:userId

// ANALYTICS
export const registerVisitApi = "/visits-stats/register-parser"; // POST
export const registerLinkClickApi = "/links-clicks/register-parser"; // POST

// BLACK CARD - MEMBERS
export const membersApi = "/members";
export const blackCardApi = "/blackcard";              // GET /:memberId (público)
export const googleWalletApi = "/passes/google";       // GET /:memberId
export const appleWalletApi = "/passes/apple";         // GET /:memberId.pkpass
export const contactVcardApi = "/contacts";            // GET /:memberId.vcf
export const memberByUserApi = "/members/user";        // GET /:userId

// HISTORIAL
export const historyApi = "/history";
export const getHistoryByBiositeApi = "/history/biosite";
