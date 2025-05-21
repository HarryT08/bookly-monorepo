import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from '../../domain/entities/role.entity';
import { RoleRepository } from '../../domain/repositories/role.repository';

/**
 * Implementaciu00f3n de MongoDB para el repositorio de roles
 */
@Injectable()
export class MongooseRoleRepository implements RoleRepository {
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<Role>
  ) {}

  async findById(id: string): Promise<Role | null> {
    return this.roleModel.findById(id).exec();
  }

  async findByName(name: string): Promise<Role | null> {
    return this.roleModel.findOne({ name }).exec();
  }

  async findAll(): Promise<Role[]> {
    return this.roleModel.find().exec();
  }

  async create(roleData: Omit<Role, '_id'>): Promise<Role> {
    const newRole = new this.roleModel(roleData);
    return newRole.save();
  }

  async update(id: string, roleData: Partial<Role>): Promise<Role | null> {
    const role = await this.findById(id);
    if (!role) return null;
    
    Object.assign(role, roleData);
    return role.save();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.roleModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async assignToUser(userId: string, roleId: string): Promise<void> {
    // En una implementaciu00f3n real, esto podr\u00eda crear una relación en otra colección
    // o comunicarse con el servicio de usuarios
    // Para este ejemplo, lo dejamos como un método vacío
  }
}
