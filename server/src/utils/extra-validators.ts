import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  validateSync,
  IsString,
  IsNumber
} from "class-validator-custom-errors";

@ValidatorConstraint({ async: false })
export class AnyOfConstraint implements ValidatorConstraintInterface {
  constructor(private validators: Function[]) { }

  validate(value: any, args: ValidationArguments) {
    const object = args.object;
    return this.validators.some((validator) => {
      const temp = { [args.property]: value };
      // @ts-ignore
      const instance = Object.assign(new object.constructor(), temp);
      return validateSync(instance, { whitelist: true }).length === 0;
    });
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must satisfy at least one of the given constraints`;
  }
}

export function AnyOf(validators: Function[], validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: validators,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return new AnyOfConstraint(validators).validate(value, args);
        },
        defaultMessage(args: ValidationArguments) {
          return new AnyOfConstraint(validators).defaultMessage(args);
        }
      }
    });
  };
}

export function IsStringOrNumber(validationOptions?: ValidationOptions) {
  return AnyOf([IsString, IsNumber], { transformKey: 'isStringOrNumber', ...validationOptions });
}