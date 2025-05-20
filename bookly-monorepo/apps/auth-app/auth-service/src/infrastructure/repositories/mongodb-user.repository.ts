import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';

// Esquema de Mongoose para User
export const UserSchema = {
  firstName: String,
  lastName: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'user', 'guest'], default: 'user' },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  refreshToken: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};

// Interface para el documento de Mongoose
export interface UserDocument extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
  lastLogin?: Date;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class MongoDBUserRepository implements UserRepository {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * Convierte un documento de Mongoose a una entidad de dominio
   */
  private toEntity(userDoc: any): User {
    return new User({
      id: userDoc._id.toString(),
      firstName: userDoc.firstName,
      lastName: userDoc.lastName,
      email: userDoc.email,
      password: userDoc.password,
      role: userDoc.role,
      isActive: userDoc.isActive,
      lastLogin: userDoc.lastLogin,
      refreshToken: userDoc.refreshToken,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
    });
  }

  async findById(id: string): Promise<User | null> {
    const userDoc = await this.userModel.findById(id).exec();
    return userDoc ? this.toEntity(userDoc) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userDoc = await this.userModel.findOne({ email }).exec();
    return userDoc ? this.toEntity(userDoc) : null;
  }

  async findAll(): Promise<User[]> {
    const userDocs = await this.userModel.find().exec();
    return userDocs.map(doc => this.toEntity(doc));
  }

  async create(user: Omit<User, 'id'>): Promise<User> {
    const newUser = new this.userModel({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      refreshToken: user.refreshToken,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });

    const savedUser = await newUser.save();
    return this.toEntity(savedUser);
  }

  async update(id: string, user: Partial<User>): Promise<User | null> {
    const updateData: any = {};
    
    // Solo incluir campos que están definidos
    if (user.firstName !== undefined) updateData.firstName = user.firstName;
    if (user.lastName !== undefined) updateData.lastName = user.lastName;
    if (user.email !== undefined) updateData.email = user.email;
    if (user.password !== undefined) updateData.password = user.password;
    if (user.role !== undefined) updateData.role = user.role;
    if (user.isActive !== undefined) updateData.isActive = user.isActive;
    if (user.lastLogin !== undefined) updateData.lastLogin = user.lastLogin;
    if (user.refreshToken !== undefined) updateData.refreshToken = user.refreshToken;
    
    // Siempre actualizar la fecha de modificación
    updateData.updatedAt = new Date();

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    return updatedUser ? this.toEntity(updatedUser) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, { 
        refreshToken, 
        updatedAt: new Date() 
      })
      .exec();
  }

  async findByRefreshToken(refreshToken: string): Promise<User | null> {
    const userDoc = await this.userModel.findOne({ refreshToken }).exec();
    return userDoc ? this.toEntity(userDoc) : null;
  }
}
