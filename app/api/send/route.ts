import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const name = formData.get("name")?.toString() || "Без имени";
    const email = formData.get("email")?.toString() || "Нет email";
    const subject = formData.get("subject")?.toString() || "Нет темы";
    const phone = formData.get("phone")?.toString() || "Нет телефона";
    const message = formData.get("message")?.toString() || "Нет сообщения";

    const transporter = nodemailer.createTransport({
      host: "smtp.mail.ru",
      port: 465,
      secure: true,
      auth: {
        user: "apk.t@mail.ru",
        pass: "e4Otde9rVG8ACUp8RFe6", // пароль приложения
      },
    });

    await transporter.sendMail({
      from: '"Форма сайта" <apk.t@mail.ru>',
      to: "bokri904@mail.ru",
      subject: `Новое сообщение от ${name} — ${subject}`,
      text: `
Имя: ${name}
Email: ${email}
Телефон: ${phone}
Сообщение: ${message}
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка отправки:", error);
    return NextResponse.json({ success: false, error: "Ошибка отправки" }, { status: 500 });
  }
}
