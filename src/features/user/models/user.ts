export interface UserFilters {
  readonly email?: string;
  readonly firstName?: string;
  readonly lastName?: string;
}

export interface User {
  readonly id: number;
  readonly email: string;
  readonly password: string;
  readonly firstName?: string;
  readonly lastName?: string;
}
