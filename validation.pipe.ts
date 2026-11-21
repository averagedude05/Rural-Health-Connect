import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from "@nestjs/common";
import { validate, ValidationError, ValidatorOptions } from "class-validator";
import { plainToInstance } from "class-transformer";

/** Flattens (nested) class-validator errors into "path: message" strings. */
const flattenErrors = (errors: ValidationError[], parent = ""): string[] =>
  errors.flatMap((error) => {
    const path = parent ? `${parent}.${error.property}` : error.property;
    const own = Object.values(error.constraints ?? {}).map(
      (message) => `${path}: ${message}`,
    );
    return [...own, ...flattenErrors(error.children ?? [], path)];
  });

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  constructor(
    private options: ValidatorOptions = {
      whitelist: true,
      forbidNonWhitelisted: true,
    },
  ) {}
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToInstance(metatype, value);
    const errors = await validate(object, this.options);
    if (errors.length > 0) {
      // "message" is unchanged so existing clients keep working;
      // "errors" tells the caller exactly which field failed and why.
      throw new BadRequestException({
        statusCode: 400,
        message: "Bad Request Payload",
        errors: flattenErrors(errors),
        error: "Bad Request",
      });
    }
    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
