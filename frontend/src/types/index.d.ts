// src/types/index.ts
export type FormType = "sign-in" | "sign-up";

export interface SignUpParams {
  uid: string;
  name: string;
  email: string;
  password: string;
}

export interface SignInParams {
  email: string;
  idToken: string;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}
