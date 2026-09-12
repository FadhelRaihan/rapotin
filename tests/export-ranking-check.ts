import assert from 'node:assert/strict';
import { exportRanks } from '../lib/export-ranking';

assert.deepEqual(exportRanks([90, 95, null, 90, 0]), [2, 1, null, 2, 4]);
assert.deepEqual(exportRanks([null, null]), [null, null]);
assert.deepEqual(exportRanks([]), []);
assert.deepEqual(exportRanks([0, null]), [1, null]);
console.log('Export ranking checks passed');
