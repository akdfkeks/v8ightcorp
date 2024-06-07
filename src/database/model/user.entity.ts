import { BaseEntity, Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ArticleEntity } from './article.entity';

export enum UserRole {
  ADMIN = 'admin',
  NORMAL = 'normal',
}

@Entity({ name: 'user' })
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', unsigned: true })
  id: number;

  @Column({ name: 'email', unique: true }) // unique: true makes index
  email: string;

  @Column({ name: 'password' })
  password: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'role', type: 'enum', enum: UserRole, default: UserRole.NORMAL })
  role: UserRole;

  @OneToMany(() => ArticleEntity, (article) => article.author)
  articles: Array<ArticleEntity>;

  public static async from(dto: { email: string; password: string; name: string; role?: UserRole }) {
    const user = new UserEntity();
    user.email = dto.email;
    user.password = await bcrypt.hash(dto.password, await bcrypt.genSalt(3));
    user.name = dto.name;
    user.role = dto.role ?? UserRole.NORMAL;
    return user;
  }
}
