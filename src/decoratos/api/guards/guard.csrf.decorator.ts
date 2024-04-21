import { csrfProtection } from '../../../security/csrf.protection.middleware';

export function CSRFProtection() {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    if (!target.constructor.prototype.mapping[propertyName]?.handlers?.length) {
      return;
    }

    target.constructor.prototype.mapping[propertyName].handlers.push(
      csrfProtection,
    );
  };
}
