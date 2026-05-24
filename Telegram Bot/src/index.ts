import { Telegraf, Context } from 'telegraf';
import { message } from 'telegraf/filters';
import * as dotenv from 'dotenv';
import path from 'path';
import http from 'http';

// Загружаем переменные окружения
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const BOT_TOKEN = process.env.BOT_TOKEN;
let ADMIN_GROUP_ID = process.env.ADMIN_GROUP_ID;

if (!BOT_TOKEN) {
  console.error('BOT_TOKEN is not defined in .env');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// Словник для збереження зв'язку: messageId у групі -> userId клієнта
// Це потрібно, щоб відповідати клієнтам навіть якщо у них прихований профіль
const messageMap = new Map<number, number>();

// Обработчик команды /start
bot.start((ctx) => {
  ctx.reply('Вітаємо! Напишіть ваше запитання, і наш менеджер відповість вам якнайшвидше. 👇');
});

// Обработчик всех текстовых сообщений
bot.on(message('text'), async (ctx) => {
  const isGroup = ctx.chat.type === 'group' || ctx.chat.type === 'supergroup';

  // 1. Если сообщение пришло в группу
  if (isGroup) {
    // Если мы еще не знаем ID группы, выводим его в консоль для разработчика
    if (!ADMIN_GROUP_ID) {
      console.log(`[INIT] Сообщение в группе! Ваш ADMIN_GROUP_ID: ${ctx.chat.id}`);
      ctx.reply(`✅ Бот успішно підключено! ID цієї групи: ${ctx.chat.id}\nБудь ласка, додайте його в .env файл.`);
      return;
    }

    // Если это наша админ-группа и это реплай на чье-то сообщение (которое бот переслал)
    if (ctx.chat.id.toString() === ADMIN_GROUP_ID && ctx.message.reply_to_message) {
      const originalMessage = ctx.message.reply_to_message;
      
      // Спершу шукаємо в нашій пам'яті (щоб обійти налаштування приватності клієнта)
      let userId = messageMap.get(originalMessage.message_id);
      
      // Якщо в пам'яті немає (наприклад, бот перезапускався), пробуємо дістати з Telegram API
      if (!userId) {
        const forwardedOrigin = (originalMessage as any).forward_origin;
        if (forwardedOrigin && forwardedOrigin.type === 'user') {
          userId = forwardedOrigin.sender_user.id;
        } else if ((originalMessage as any).forward_from) {
          userId = (originalMessage as any).forward_from.id;
        }
      }

      if (userId) {
        try {
          // Отправляем ответ админа клиенту
          await bot.telegram.sendMessage(userId, ctx.message.text);
          // Ставим реакцию, что ответ ушел (працює лише в супергрупах, тому обгортаємо в try/catch)
          try { await ctx.react('👍'); } catch (e) {} 
        } catch (error) {
          console.error('Ошибка отправки клиенту:', error);
          ctx.reply('❌ Помилка: Не вдалося відправити повідомлення клієнту. Можливо, він заблокував бота.');
        }
      } else {
         ctx.reply('❌ Не вдалося знайти клієнта для відповіді. Можливо, у нього прихований профіль, а бот нещодавно перезапускався.');
      }
    }
    return;
  }

  // 2. Если сообщение пришло от клиента в личку боту
  if (!isGroup) {
    if (!ADMIN_GROUP_ID) {
      ctx.reply('Вибачте, технічна пауза: бот ще не підключений до панелі адміністратора.');
      return;
    }

    try {
      // Пересылаем сообщение в админ-группу
      const forwarded = await ctx.forwardMessage(ADMIN_GROUP_ID);
      // Зберігаємо зв'язок: ID пересланого повідомлення в групі -> ID клієнта
      messageMap.set(forwarded.message_id, ctx.from.id);
      
      // Очищаємо старі повідомлення, щоб Map не ріс безкінечно (залишаємо останні 1000)
      if (messageMap.size > 1000) {
        const firstKey = messageMap.keys().next().value;
        if (firstKey !== undefined) {
          messageMap.delete(firstKey);
        }
      }
    } catch (error) {
      console.error('Ошибка пересылки в админ-группу:', error);
      ctx.reply('Вибачте, сталася помилка. Спробуйте пізніше.');
    }
  }
});

// Запускаем бота
bot.launch()
  .then(() => {
    console.log('🤖 Бот успешно запущен!');
    if (!ADMIN_GROUP_ID) {
      console.log('⚠️ ВНИМАНИЕ: ADMIN_GROUP_ID не установлен!');
      console.log('👉 Напишите любое сообщение в админ-группу, чтобы узнать её ID.');
    } else {
      console.log(`✅ ADMIN_GROUP_ID установлен: ${ADMIN_GROUP_ID}`);
    }
  })
  .catch((err) => {
    console.error('Ошибка запуска бота:', err);
  });

// Додаємо простий HTTP сервер, щоб Render (або інший хостинг) бачив, що додаток "живий"
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Telegram Bot is running!');
});
server.listen(PORT, () => {
  console.log(`🌐 HTTP сервер запущено на порту ${PORT} (для health check хостингу)`);
});

// Включение плавного завершения работы
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
