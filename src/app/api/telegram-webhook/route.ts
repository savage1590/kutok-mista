import { NextRequest, NextResponse } from 'next/server';
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { supabaseAdmin } from '@/lib/supabaseAdmin'; // use the existing admin client

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_GROUP_ID = process.env.ADMIN_GROUP_ID;

if (!BOT_TOKEN) {
  // If the token is missing, we can't initialize the bot, but we shouldn't crash the build.
  console.warn('BOT_TOKEN is not defined in environment variables.');
}

// We initialize Telegraf inside the route or lazily so it doesn't break at build time if env is missing
const bot = BOT_TOKEN ? new Telegraf(BOT_TOKEN) : null;

if (bot) {
  // --- TELEGRAM BOT LOGIC ---

  // Обработчик команды /start
  bot.start((ctx) => {
    ctx.reply('Вітаємо! Напишіть ваше запитання, і наш менеджер відповість вам якнайшвидше. 👇');
  });

  // Обработчик текстовых сообщений
  bot.on(message('text'), async (ctx) => {
    const isGroup = ctx.chat.type === 'group' || ctx.chat.type === 'supergroup';

    // 1. Сообщение пришло в группу
    if (isGroup) {
      if (!ADMIN_GROUP_ID) {
        console.log(`[INIT] Сообщение в группе! Ваш ADMIN_GROUP_ID: ${ctx.chat.id}`);
        await ctx.reply(`✅ Бот успішно підключено! ID цієї групи: ${ctx.chat.id}\nБудь ласка, додайте його в змінні оточення Vercel як ADMIN_GROUP_ID.`);
        return;
      }

      // Если это наша админ-группа и это реплай на чье-то сообщение
      if (ctx.chat.id.toString() === ADMIN_GROUP_ID && ctx.message.reply_to_message) {
        const originalMessage = ctx.message.reply_to_message;
        const replyMessageId = originalMessage.message_id;
        
        let userId: number | null = null;

        // Шукаємо в базі даних Supabase зв'язок (щоб обійти налаштування приватності клієнта)
        const { data, error } = await supabaseAdmin
          .from('bot_messages')
          .select('client_user_id')
          .eq('group_message_id', replyMessageId)
          .single();
          
        if (data && !error) {
          userId = data.client_user_id;
        }
        
        // Якщо в базі немає (наприклад, старе повідомлення), пробуємо дістати з Telegram API
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
            await bot.telegram.sendMessage(userId, ctx.message.text);
            try { await ctx.react('👍'); } catch (e) {} 
          } catch (error) {
            console.error('Ошибка отправки клиенту:', error);
            await ctx.reply('❌ Помилка: Не вдалося відправити повідомлення клієнту. Можливо, він заблокував бота.');
          }
        } else {
           await ctx.reply('❌ Не вдалося знайти клієнта для відповіді. Можливо, у нього прихований профіль, а повідомлення занадто старе (немає в базі).');
        }
      }
      return;
    }

    // 2. Сообщение пришло от клиента в личку боту
    if (!isGroup) {
      if (!ADMIN_GROUP_ID) {
        await ctx.reply('Вибачте, технічна пауза: бот ще не підключений до панелі адміністратора.');
        return;
      }

      try {
        // Пересылаем сообщение в админ-группу
        const forwarded = await ctx.forwardMessage(ADMIN_GROUP_ID);
        
        // Зберігаємо зв'язок: ID пересланого повідомлення в групі -> ID клієнта в Supabase
        const { error } = await supabaseAdmin
          .from('bot_messages')
          .insert({
            group_message_id: forwarded.message_id,
            client_user_id: ctx.from.id
          });
          
        if (error) {
          console.error('Помилка збереження в Supabase:', error);
        }
      } catch (error) {
        console.error('Ошибка пересылки в админ-группу:', error);
        await ctx.reply('Вибачте, сталася помилка. Спробуйте пізніше.');
      }
    }
  });
}

// Функція обробки POST запитів (Webhooks від Telegram)
export async function POST(req: NextRequest) {
  if (!bot) {
    return NextResponse.json({ error: 'Bot is not configured' }, { status: 500 });
  }

  try {
    const body = await req.json();
    
    // Передаємо апдейт у Telegraf для обробки
    await bot.handleUpdate(body);
    
    // Завжди повертаємо 200 OK, щоб Telegram зрозумів, що ми отримали повідомлення
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    // Навіть при помилках краще повертати 200, інакше Telegram буде повторювати запит безкінечно
    return NextResponse.json({ ok: true, error: 'Internal Server Error handled' });
  }
}

// Проста перевірка статусу бота через GET-запит
export async function GET() {
  return NextResponse.json({ 
    status: 'Telegram Bot API is running', 
    botConfigured: !!bot 
  });
}
