const path = require('path');
const request = require('supertest');
const { spawn } = require('child_process');

let serverProcess;

beforeAll((done) => {
  const serverPath = path.join(__dirname, 'index.js');
  serverProcess = spawn('node', [serverPath]);

  serverProcess.stdout.on('data', (data) => {
    if (data.toString().includes('Express:')) {
      done();
    }
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(data.toString());
  });
});

afterAll(() => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

test('should stream music with partial content', async () => {
  const res = await request('http://localhost:3003')
    .get('/music/Kupla-Orchid.mp3')
    .set('Range', 'bytes=0-');

  expect(res.status).toBe(206);
  expect(res.headers['content-range']).toBeDefined();
  expect(res.headers['content-type']).toBeDefined();
});
