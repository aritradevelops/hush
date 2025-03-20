import { registerDecorator, ValidationOptions, ValidationArguments } from "class-validator";
import ms from "ms";

export function IsValidMs(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isValidMs",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          return typeof value === "string" && ms(value) > 0;
        }
      }
    });
  };
}