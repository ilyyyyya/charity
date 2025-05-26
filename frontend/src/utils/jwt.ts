import { Role } from '../types/index';

interface DecodedToken {
  sub: string; // username
  displayName: string;
  role: Role;
  exp: number;
  iat: number;
}

export const decodeToken = (token: string): DecodedToken => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    throw new Error('Invalid token');
  }
}; 