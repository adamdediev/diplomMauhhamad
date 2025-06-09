const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const data = JSON.parse(event.body);
  const { name, email, message } = data;

  const telegramBotToken = process.env7669585321AAHmmmBE2KH7oz5oDIr3S8BXJWmEpLY2tKA; // Из переменных окружения Netlify
  const telegramChatId = process.env1798819127;     // Из переменных окружения Netlify
  const telegramApiUrl = `https://api.telegram.org/bot$7669585321:AAHmmmBE2KH7oz5oDIr3S8BXJWmEpLY2tKAtelegramBotToken}/sendMessage`;

  const telegramMessage = `Новое сообщение от:\nИмя: ${name}\nEmail: ${email}\nСообщение: ${message}`;

  try {
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: telegramMessage
      })
    });

    if (response.ok) {
      return { statusCode: 200, body: 'Сообщение успешно отправлено!' };
    } else {
      console.error('Ошибка при отправке сообщения в Telegram:', response.status, response.statusText);
      return { statusCode: 500, body: 'Ошибка при отправке сообщения в Telegram.' };
    }
  } catch (error) {
    console.error('Ошибка при отправке сообщения в Telegram:', error);
    return { statusCode: 500, body: 'Ошибка при отправке сообщения в Telegram.' };
  }
};