
export const methodMap = new Map<string, string>();
const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;
export default function Method(method: typeof methods[number]) {
  return function (cls: any, propertyKey: string, descriptor: PropertyDescriptor) {
    methodMap.set(`${cls.constructor.name}_${propertyKey}`, method);
    return descriptor;
  };
}

export function GET() {
  return Method('GET');
}

export function POST() {
  return Method('POST');
}

export function PUT() {
  return Method('PUT');
}

export function DELETE() {
  return Method('DELETE');
}

export function PATCH() {
  return Method('PATCH');
}