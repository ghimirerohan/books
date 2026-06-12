import { SchemaStub } from 'schemas/types';
import IndianSchemas from './in';
import SwissSchemas from './ch';
import NepaliSchemas from './np';

/**
 * Regional Schemas are exported by country code.
 */
export default {
  in: IndianSchemas,
  ch: SwissSchemas,
  np: NepaliSchemas,
} as Record<string, SchemaStub[]>;
