import 'dotenv/config';
import { createAppServer } from './app.mjs';

const PORT = Number(process.env.PORT || 9191);
const server = createAppServer();

server.listen(PORT, () => {
  console.log(`Sao Do assistant backend running at http://localhost:${PORT}`);
});
