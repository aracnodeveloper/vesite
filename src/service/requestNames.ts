const UUID_SEGMENT = "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface RequestNamePattern {
  method?: HttpMethod;
  pattern: RegExp;
  name: string;
}

const patterns: RequestNamePattern[] = [
  { method: "POST", pattern: /^\/auth\/login-flexible$/, name: "LOGIN_USER" },
  { method: "POST", pattern: /^\/auth\/register$/, name: "REGISTER_USER" },
  { method: "POST", pattern: /^\/auth\/refresh-token$/, name: "REFRESH_ACCESS_TOKEN" },
  { method: "GET", pattern: /^\/plantillas$/, name: "GET_TEMPLATES" },
  { method: "GET", pattern: new RegExp(`^/users/${UUID_SEGMENT}$`), name: "GET_USER_BY_ID" },
  { method: "PATCH", pattern: new RegExp(`^/users/${UUID_SEGMENT}$`), name: "UPDATE_USER" },
  { method: "DELETE", pattern: new RegExp(`^/users/${UUID_SEGMENT}$`), name: "DELETE_USER" },
  { method: "GET", pattern: new RegExp(`^/users/${UUID_SEGMENT}/childrens$`), name: "GET_CHILD_USERS" },
  { method: "GET", pattern: new RegExp(`^/biosites/${UUID_SEGMENT}$`), name: "GET_BIOSITE_BY_ID" },
  { method: "PATCH", pattern: new RegExp(`^/biosites/${UUID_SEGMENT}$`), name: "UPDATE_BIOSITE" },
  { method: "DELETE", pattern: new RegExp(`^/biosites/${UUID_SEGMENT}$`), name: "DELETE_BIOSITE" },
  { method: "GET", pattern: new RegExp(`^/biosites/user/${UUID_SEGMENT}$`), name: "GET_BIOSITES_BY_USER" },
  { method: "GET", pattern: new RegExp(`^/biosites/admin/${UUID_SEGMENT}$`), name: "GET_BIOSITES_BY_ADMIN" },
  { method: "GET", pattern: new RegExp(`^/biosites/analytics/${UUID_SEGMENT}$`), name: "GET_BIOSITE_ANALYTICS" },
  { method: "GET", pattern: /^\/biosites\/slug\/[^/]+$/, name: "GET_BIOSITE_BY_SLUG" },
  { method: "GET", pattern: new RegExp(`^/section/biosite/${UUID_SEGMENT}$`), name: "GET_SECTIONS_BY_BIOSITE" },
  { method: "PATCH", pattern: new RegExp(`^/section/reorder/${UUID_SEGMENT}$`), name: "REORDER_SECTIONS" },
  { method: "GET", pattern: new RegExp(`^/links/biosite/${UUID_SEGMENT}$`), name: "GET_LINKS_BY_BIOSITE" },
  { method: "PATCH", pattern: new RegExp(`^/links/reorder/${UUID_SEGMENT}$`), name: "REORDER_LINKS" },
  { method: "GET", pattern: new RegExp(`^/texts-blocks/biosite/${UUID_SEGMENT}$`), name: "GET_TEXT_BLOCKS_BY_BIOSITE" },
  { method: "GET", pattern: new RegExp(`^/history/biosite/${UUID_SEGMENT}$`), name: "GET_HISTORIES_BY_BIOSITE" },
  { method: "POST", pattern: /^\/history$/, name: "CREATE_HISTORY" },
  { method: "POST", pattern: /^\/upload\/history-media$/, name: "UPLOAD_HISTORY_MEDIA" },
  { method: "PATCH", pattern: new RegExp(`^/history/${UUID_SEGMENT}$`), name: "UPDATE_HISTORY" },
  { method: "DELETE", pattern: new RegExp(`^/history/${UUID_SEGMENT}$`), name: "DELETE_HISTORY" },
  { method: "GET", pattern: new RegExp(`^/business-cards/user/${UUID_SEGMENT}$`), name: "GET_BUSINESS_CARD_BY_USER" },
  { method: "GET", pattern: /^\/themes$/, name: "GET_THEMES" },
  { method: "GET", pattern: /^\/themes\/categories$/, name: "GET_THEME_CATEGORIES" },
  { method: "GET", pattern: /^\/themes\/cities$/, name: "GET_CITY_THEMES" },
  { method: "GET", pattern: /^\/themes\/fonts$/, name: "GET_THEME_FONTS" },
];

const methodAction: Record<HttpMethod, string> = {
  GET: "GET",
  POST: "CREATE",
  PATCH: "UPDATE",
  PUT: "REPLACE",
  DELETE: "DELETE",
};

const getPathname = (url: string) => {
  try {
    return new URL(url, "http://vesite.local").pathname.replace(/\/$/, "") || "/";
  } catch {
    return url.split("?")[0].replace(/\/$/, "") || "/";
  }
};

export const getRequestName = (methodValue: string | undefined, url = "/") => {
  const method = (methodValue?.toUpperCase() || "GET") as HttpMethod;
  const pathname = getPathname(url);
  const configuredName = patterns.find(
    (entry) => (!entry.method || entry.method === method) && entry.pattern.test(pathname)
  )?.name;

  if (configuredName) return configuredName;

  const normalizedPath = pathname
    .split("/")
    .filter(Boolean)
    .map((segment) =>
      new RegExp(`^${UUID_SEGMENT}$`).test(segment)
        ? "BY_ID"
        : segment.replace(/[^a-zA-Z0-9]+/g, "_").toUpperCase()
    )
    .filter(Boolean)
    .join("_");

  return `${methodAction[method] ?? method}_${normalizedPath || "ROOT"}`;
};
