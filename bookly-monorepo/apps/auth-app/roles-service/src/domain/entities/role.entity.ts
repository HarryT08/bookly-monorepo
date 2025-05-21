import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Role extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: [String], default: [] })
  permissions: string[];
  
  // Propiedades automáticamente generadas por Mongoose timestamps
  createdAt: Date;
  updatedAt: Date;
}

export const RoleSchema = SchemaFactory.createForClass(Role);

// Domain model method for role creation
RoleSchema.statics.createRole = async function (roleData) {
  const role = new this(roleData);
  return role.save();
};

// Domain model method for finding a role by name
RoleSchema.statics.findByName = async function (name) {
  return this.findOne({ name }).exec();
};
