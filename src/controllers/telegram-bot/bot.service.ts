import { MessageUpdate, TelegramBot, UpdateType } from "telegram-bot";
import { Context } from "oak";
import { ChatGPTAPI } from "chatgpt";
import "https://deno.land/x/dotenv@v3.2.0/load.ts";

class BotService {
  private _bot: TelegramBot;

  constructor() {
    this._bot = new TelegramBot(Deno.env.get("TELEGRAM_TOKEN") as string);

    this._bot.on(UpdateType.Message, async ({ message }) => {
      const { chat: { id }, text } = message;

      await this._bot.sendMessage({
        chat_id: id,
        text: text || "",
        parse_mode: "Markdown",
      });
    });
  }

  public async botUpdate(ctx: Context) {
    const { request, response } = ctx;
    const update: MessageUpdate = await request.body().value;

    response.status = 200;

    if (!update.message.text) {
      return;
    }

    const answer = await this.chatGPTGetAnswer(update.message.text);

    this._bot.sendMessage({
      chat_id: update.message.chat.id,
      text: answer,
      reply_to_message_id: update.message.message_id,
      parse_mode: "Markdown",
    });
  }

  public async chatGPTGetAnswer(question: string) {
    const api = new ChatGPTAPI({
      sessionToken: Deno.env.get("SESSION_TOKEN") as string,
    });

    await api.ensureAuth();

    const response = await api.sendMessage(question);

    return response;
  }
}

export default new BotService();
