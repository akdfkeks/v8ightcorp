import { UserRole } from 'src/database/model/user.entity';

export interface ReqUser {
  id: number;
  role: UserRole;
}
