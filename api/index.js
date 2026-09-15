import app, { databaseReady } from '../app.js';
import serverless from 'serverless-http';

await databaseReady;

export default serverless(app);
