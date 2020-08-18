import { User } from '../models/user';

export interface UserDto {
  id: number;
  firstName?: string;
  lastName?: string;
  email: string;
}
export const makeUserDto = (user: User): UserDto => ({
  id: user.id,
  firstName: user.firstName ?? undefined,
  lastName: user.lastName ?? undefined,
  email: user.email,
});
