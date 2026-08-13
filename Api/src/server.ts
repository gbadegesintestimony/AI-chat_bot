import { createApp } from "./app";
import { env } from "./config/env";
import { startConversationCleanup } from "./services/conversation/conversationService";

const app = createApp();
startConversationCleanup();

app.listen(env.PORT, () => {
  console.log(`GOBD AI Fault-Code backend listening on port ${env.PORT} (${env.NODE_ENV})`);
});
