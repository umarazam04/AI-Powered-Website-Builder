import { pathToRegexp } from 'path-to-regexp';

const patterns = [
  '/api/auth/{:any}',
  '/api/auth/{*any}',
  '/api/auth/{+any}',
  '/api/auth/{:splat*}',
  '/api/auth/{:splat+}',
];

for (const pattern of patterns) {
  try {
    const result = pathToRegexp(pattern);
    console.log(`Pattern: "${pattern}" => OK, regexp: ${result.regexp}`);
  } catch (error: any) {
    console.log(`Pattern: "${pattern}" => FAIL: ${error.message}`);
  }
}
