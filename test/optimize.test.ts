import path from 'path';
import fs from 'fs';
import { optimize } from '../src/optimize';

const input = fs.readFileSync(path.resolve(__dirname, '../fixtures/proto.d.ts'), 'utf-8');

test('optimize - without ns', () => {
  expect(optimize(input, {})).toMatchSnapshot();
});

test('optimize - with ns', () => {
  expect(optimize(input, { root: '', api: 'example' })).toMatchSnapshot();
});
