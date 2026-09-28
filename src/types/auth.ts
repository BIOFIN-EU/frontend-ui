export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in_hours: number;
};

export type MeResponse = {
  id: string;
  name?: string;
  email?: string;
};
