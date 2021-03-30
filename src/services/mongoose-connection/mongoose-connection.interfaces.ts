import mongoose from 'mongoose';

export interface IMongooseConnectionService {
  readonly connection: mongoose.Connection;
}
