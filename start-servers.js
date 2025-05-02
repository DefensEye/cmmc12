import { spawn } from 'child_process';
import path from 'path';

// Start backend server
const backend = spawn('node', ['server.js'], {
  stdio: 'inherit',
  shell: true
});

backend.on('error', (err) => {
  console.error('Failed to start backend server:', err);
});

// Start frontend server
const frontend = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

frontend.on('error', (err) => {
  console.error('Failed to start frontend server:', err);
});

// Handle process termination
process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit();
}); 