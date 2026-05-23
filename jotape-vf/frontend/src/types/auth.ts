/** Contratos API de autenticación (español, alineados con FastAPI). */

export type UsuarioPublico = {
  id: string;
  email: string;
  nombre_completo: string | null;
  activo: boolean;
  creado_en: string;
};

export type UsuarioCrear = {
  email: string;
  contrasena: string;
  nombre_completo?: string | null;
};

export type InicioSesionSolicitud = {
  email: string;
  contrasena: string;
};

export type TokenRespuesta = {
  access_token: string;
  token_type: string;
};

export type ErrorApi = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};
