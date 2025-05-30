const express = require('express');
const { Client, middleware } = require('@line/bot-sdk');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config();
// LINE BOT 設定
const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};
const lineClient = new Client(lineConfig);

// OpenAI 設定
const openai = new OpenAIApi(new Configuration({
  apiKey:'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',
}));

// 處理 LINE Webhook
app.post('/webhook', middleware(lineConfig), async (req, res) => {
  const events = req.body.events;
  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const userMessage = event.message.text;
      try {
        const gptResponse = await openai.createChatCompletion({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: userMessage }],
        });
        const replyMessage = gptResponse.data.choices[0].message.content;
        await lineClient.replyMessage(event.replyToken, {
          type: 'text',
          text: replyMessage,
        });
      } catch (error) {
        console.error(error);
        await lineClient.replyMessage(event.replyToken, {
          type: 'text',
          text: '抱歉，我無法處理您的訊息。',
        });
      }
    }
  }
  res.status(200).send('OK');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
