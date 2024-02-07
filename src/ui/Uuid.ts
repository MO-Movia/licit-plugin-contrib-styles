// [FS] IRAD-1005 2020-07-07
// Upgrade outdated packages.
import { v1 as uuidv1 } from 'uuid';

export function uuid(): string {
  return uuidv1();
}
