//AUTH

export const loginApi: string = "/auth/login"
export const registerStudentApi: string = "/auth/register"

//METRICS

export const metricsApi = "/biosites/analytics";

//Themes-Templates

export const themesApi ="/themes"

//Profile
export const updateBiositeApi = "/biosites";
export const updateStaticApi = "/biosites/static";
export const getBiositeApi = "/biosites/user";

//Links
export const LinksApi = "/links"

//upload

export const uploadImageApi: string = "/upload/image";
export const deleteImageApi: string = "/upload/image"; // DELETE /{filename}
export const uploadUserAvatarApi: string = "/upload/user-avatar"; // POST /{userId}
export const uploadBiositeAvatarApi: string = "/upload/biosite-avatar"; // POST /{biositeId}
export const uploadBiositeBackgroundApi: string = "/upload/biosite-background";