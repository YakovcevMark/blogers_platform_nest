export const jwtConstants = {
  access_token_secret:
    'ACCESS DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.', // TODO to env
  refresh_token_secret:
    'REFRESH DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.', // TODO to env
};
export const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';
export const ACCESS_TOKEN_INJECT_TOKEN = Symbol('access-token-inject');
export const REFRESH_TOKEN_INJECT_TOKEN = Symbol('refresh-token-inject');
