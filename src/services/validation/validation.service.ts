/* eslint-disable no-underscore-dangle */
import { injectable, inject } from 'inversify';

import Joi, {
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

import { IEnums, IModules, IServices, tokens } from '../../container';

@injectable()
export default class ValidationService
  implements IServices.Validation.IValidationService {
  constructor(
    @inject(tokens.enums.ResponseTypeEnumToken)
    private readonly responseType: IEnums.IResponseType,

    @inject(tokens.services.ResponseServiceToken)
    private readonly responseService: IServices.Response.IResponseService,
  ) {}

  public string(): StringSchema {
    return Joi.string();
  }

  public number(): NumberSchema {
    return Joi.number();
  }

  public boolean(): BooleanSchema {
    return Joi.boolean();
  }

  public array(): ArraySchema {
    return Joi.array();
  }

  public symbol(): SymbolSchema {
    return Joi.symbol();
  }

  public function(): FunctionSchema {
    return Joi.function();
  }

  public object<TSchema = any, T = TSchema>(
    schema: SchemaMap<T> = {},
  ): ObjectSchema<TSchema> {
    return Joi.object<TSchema, T>(schema);
  }

  public any(): AnySchema {
    return Joi.any();
  }

  public binary(): BinarySchema {
    return Joi.binary();
  }

  public date(): DateSchema {
    return Joi.date();
  }

  public getSchemaFromObjectSchema(objectSchema: ObjectSchema, key: string) {
    // @ts-ignore
    return objectSchema._ids._byKey.get(key).schema;
  }

  private async validation(schema: Schema, dataForValidation: any) {
    if (!dataForValidation) {
      return this.responseService.responseFromService({
        data: null,
        errors: { notExist: 'Data has not been transferred.' },
        message: 'Invalid data.',
        responseType: this.responseType.INVALID_DATA,
        success: false,
      });
    }

    try {
      await schema.validateAsync(dataForValidation, {
        abortEarly: false,
      });

      return this.responseService.responseFromService({
        data: null,
        errors: null,
        message: 'No errors found.',
        responseType: this.responseType.OK,
        success: true,
      });
    } catch (err) {
      const errors = err.details.reduce((acc: any, error: any) => {
        if (error.context?.key) acc[error.context.key] = error.message;
        return acc;
      }, {});

      return this.responseService.responseFromService({
        data: null,
        errors,
        message: 'Invalid data.',
        responseType: this.responseType.INVALID_DATA,
        success: false,
      });
    }
  }

  public async validationObject<T>(objectSchema: ObjectSchema<T>, dataForValidation: T) {
    return this.validation(objectSchema, dataForValidation);
  }

  public async validationData(schema: Schema, dataForValidation: any) {
    return this.validation(schema, dataForValidation);
  }
}
