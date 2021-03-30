import {
  ObjectSchema,
  StringSchema,
  NumberSchema,
  SchemaMap,
  ArraySchema,
  BooleanSchema,
  SymbolSchema,
  FunctionSchema,
  AnySchema,
  BinarySchema,
  DateSchema,
  Schema,
} from 'joi';

import { IServices } from '../../container';

export interface IValidationService {
  string: () => StringSchema;

  number: () => NumberSchema;

  boolean: () => BooleanSchema;

  array: () => ArraySchema;

  symbol: () => SymbolSchema;

  function: () => FunctionSchema;

  object: <TSchema = any, T = TSchema>(schema?: SchemaMap<T>) => ObjectSchema<TSchema>;

  any: () => AnySchema;

  binary: () => BinarySchema;

  date: () => DateSchema;

  validationData: (
    schema: Schema,
    dataForValidation: any,
  ) => Promise<IServices.Response.IResponseFromService<null>>;

  getSchemaFromObjectSchema: (objectSchema: ObjectSchema, key: string) => Schema;

  validationObject: <T>(
    objectSchema: ObjectSchema<T>,
    dataForValidation: T,
  ) => Promise<IServices.Response.IResponseFromService>;
}
