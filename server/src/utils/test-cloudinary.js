import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'dgbrtqskx',
  api_key: '547955986139263',
  api_secret: 'jXeJxCJsSVKF1qeC9VvcmgYj75o',
});

console.log('Testing Cloudinary credentials...');
try {
  const res = await cloudinary.api.ping();
  console.log('SUCCESS: Cloudinary Ping Response:', res);
} catch (err) {
  console.error('FAILED: Cloudinary test error:', err.message);
}
