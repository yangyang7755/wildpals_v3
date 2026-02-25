import "dotenv/config";
import { createServer } from "./index";

const app = createServer();
const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`🚀 Wildpals Backend Server running`);
  console.log(`🔧 API: http://localhost:${port}/api`);
  console.log(`📧 Email verification ready`);
  console.log(`\n📱 Start Expo app with: npm start`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Shutting down gracefully");
  process.exit(0);
});
