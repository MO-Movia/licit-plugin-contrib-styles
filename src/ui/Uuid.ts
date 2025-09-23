import { v1 as uuidv1 } from 'uuid';

export function uuid(): string {
  return uuidv1();
}
