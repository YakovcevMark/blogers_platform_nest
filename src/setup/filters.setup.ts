import { INestApplication } from '@nestjs/common';
import { DomainHttpExceptionsFilter } from '../core/exceptions/filters/domain-exceptions.filter';
import { AllHttpExceptionsFilter } from '../core/exceptions/filters/all-exceptions.filter';

export function filtersSetup(app: INestApplication) {
  app.useGlobalFilters(
    new AllHttpExceptionsFilter(),
    new DomainHttpExceptionsFilter(),
  );
}
