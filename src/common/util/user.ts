import { UserRole } from 'src/database/model/user.entity';

export const isAdmin = ({ role }: { role: string }): boolean => role === UserRole.ADMIN;
