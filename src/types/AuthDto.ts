export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  documento: string;
  nombre: string;
  apellido: string;
  username: string;
  password: string;
  email: string;
  telefono?: string;
  empresa: number;
  pais: string;
  rol: number;
}

export interface AuthResponse {
  user: any;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}
