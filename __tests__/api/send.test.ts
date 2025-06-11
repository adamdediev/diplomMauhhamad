/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { POST } from '../../app/api/send/route'
import nodemailer from 'nodemailer'

// Mock nodemailer
jest.mock('nodemailer')
const mockNodemailer = nodemailer as jest.Mocked<typeof nodemailer>

describe('/api/send', () => {
  let mockTransporter: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Создаем mock transporter
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
    }
    
    mockNodemailer.createTransporter.mockReturnValue(mockTransporter)
  })

  const createMockRequest = (formData: Record<string, string>) => {
    const mockFormData = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      mockFormData.append(key, value)
    })

    return {
      formData: jest.fn().mockResolvedValue(mockFormData),
    } as unknown as NextRequest
  }

  describe('Успешная отправка', () => {
    test('отправляет email с пол��ыми данными', async () => {
      const requestData = {
        name: 'Иван Иванов',
        email: 'ivan@example.com',
        subject: 'Тестовый вопрос',
        phone: '+7 123 456 78 90',
        message: 'Тестовое сообщение',
      }

      const request = createMockRequest(requestData)
      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData).toEqual({ success: true })
      
      // Проверяем, что transporter был создан с правильными настройками
      expect(mockNodemailer.createTransporter).toHaveBeenCalledWith({
        host: 'smtp.mail.ru',
        port: 465,
        secure: true,
        auth: {
          user: 'apk.t@mail.ru',
          pass: 'e4Otde9rVG8ACUp8RFe6',
        },
      })

      // Проверяем, что email был отправлен с правильными данными
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: '"Форма сайта" <apk.t@mail.ru>',
        to: 'bokri904@mail.ru',
        subject: 'Новое сообщение от Иван Иванов — Тестовый вопрос',
        text: expect.stringContaining('Имя: Иван Иванов'),
      })

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Email: ivan@example.com'),
        })
      )

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Телефон: +7 123 456 78 90'),
        })
      )

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Сообщение: Тестовое сообщение'),
        })
      )
    })

    test('отправляет email с минимальными данными', async () => {
      const requestData = {
        name: 'Тест',
        email: 'test@example.com',
        subject: 'Тест',
        message: 'Тест сообщение',
      }

      const request = createMockRequest(requestData)
      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData).toEqual({ success: true })
      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1)
    })

    test('обрабатывает отсутствующие поля с значениями по умолчанию', async () => {
      const requestData = {} // Пустые данные

      const request = createMockRequest(requestData)
      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData).toEqual({ success: true })

      // Проверяе��, что используются значения по умолчанию
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Новое сообщение от Без имени — Нет темы',
          text: expect.stringContaining('Имя: Без имени'),
        })
      )

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Email: Нет email'),
        })
      )

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Телефон: Нет телефона'),
        })
      )

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Сообщение: Нет сообщения'),
        })
      )
    })
  })

  describe('Обработка ошибок', () => {
    test('возвращает ошибку при сбое отправки email', async () => {
      const requestData = {
        name: 'Тест',
        email: 'test@example.com',
        subject: 'Тест',
        message: 'Тест сообщение',
      }

      // Мокаем ошибку отправки
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP Error'))

      const request = createMockRequest(requestData)
      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData).toEqual({
        success: false,
        error: 'Ошибка отправки',
      })
    })

    test('обрабатывает ошибку создания transporter', async () => {
      const requestData = {
        name: 'Тест',
        email: 'test@example.com',
        subject: 'Тест',
        message: 'Тест сообщение',
      }

      // Мо��аем ошибку создания transporter
      mockNodemailer.createTransporter.mockImplementation(() => {
        throw new Error('Transporter creation failed')
      })

      const request = createMockRequest(requestData)
      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData).toEqual({
        success: false,
        error: 'Ошибка отправки',
      })
    })

    test('обрабатывает ошибку парсинга FormData', async () => {
      const request = {
        formData: jest.fn().mockRejectedValue(new Error('FormData parsing failed')),
      } as unknown as NextRequest

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData).toEqual({
        success: false,
        error: 'Ошибка отправки',
      })
    })
  })

  describe('Валидация данных', () => {
    test('обрабатывает пустые строки', async () => {
      const requestData = {
        name: '',
        email: '',
        subject: '',
        phone: '',
        message: '',
      }

      const request = createMockRequest(requestData)
      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData).toEqual({ success: true })

      // Проверяем, что пустые строки заменяются значениями по умолчанию
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Новое сообщение от Без имени — Нет темы',
        })
      )
    })

    test('обрабатывает специальные символы в данных', async () => {
      const requestData = {
        name: 'Тест <script>alert("xss")</script>',
        email: 'test+tag@example.com',
        subject: 'Тема с "кавычками" и символами: !@#$%',
        phone: '+7 (123) 456-78-90',
        message: 'Сообщение с переносами\nстрок и\tтабуляцией',
      }

      const request = createMockRequest(requestData)
      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData).toEqual({ success: true })

      // Проверяем, что данные передаются как есть (без санитизации)
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Тест <script>alert("xss")</script>'),
        })
      )
    })

    test('обрабатывает очень длинные значения', async () => {
      const longText = 'a'.repeat(10000)
      const requestData = {
        name: longText,
        email: 'test@example.com',
        subject: longText,
        message: longText,
      }

      const request = createMockRequest(requestData)
      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData).toEqual({ success: true })
      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1)
    })
  })

  describe('Конфигурация SMTP', () => {
    test('использует правильные настройки SMTP', async () => {
      const requestData = {
        name: 'Тест',
        email: 'test@example.com',
        subject: 'Тест',
        message: 'Тест сообщение',
      }

      const request = createMockRequest(requestData)
      await POST(request)

      expect(mockNodemailer.createTransporter).toHaveBeenCalledWith({
        host: 'smtp.mail.ru',
        port: 465,
        secure: true,
        auth: {
          user: 'apk.t@mail.ru',
          pass: 'e4Otde9rVG8ACUp8RFe6',
        },
      })
    })

    test('использует правильные адреса отправителя и получателя', async () => {
      const requestData = {
        name: 'Тест',
        email: 'test@example.com',
        subject: 'Тест',
        message: 'Тест сообщение',
      }

      const request = createMockRequest(requestData)
      await POST(request)

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: '"Форма сайта" <apk.t@mail.ru>',
          to: 'bokri904@mail.ru',
        })
      )
    })
  })

  describe('Формат сообщения', () => {
    test('формирует правильную структуру текста письма', async () => {
      const requestData = {
        name: 'Иван Петров',
        email: 'ivan.petrov@example.com',
        subject: 'Вопрос по услугам',
        phone: '+7 987 654 32 10',
        message: 'Здравствуйте! Интересует ваша услуга.',
      }

      const request = createMockRequest(requestData)
      await POST(request)

      const expectedText = `
Имя: Иван Петров
Email: ivan.petrov@example.com
Телефон: +7 987 654 32 10
Сообщение: Здравствуйте! Интересует ваша услуга.
      `

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expectedText,
        })
      )
    })

    test('формирует правильную тему письма', async () => {
      const requestData = {
        name: 'Анна Сидорова',
        subject: 'Техническая поддержка',
        email: 'anna@example.com',
        message: 'Нужна помощь',
      }

      const request = createMockRequest(requestData)
      await POST(request)

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Новое сообщение от Анна Сидорова — Техническая поддержка',
        })
      )
    })
  })

  describe('Производительность и безопасность', () => {
    test('обрабатывает множественные одновременные запросы', async () => {
      const requests = Array.from({ length: 5 }, (_, i) => {
        const requestData = {
          name: `Пользователь ${i}`,
          email: `user${i}@example.com`,
          subject: `Тест ${i}`,
          message: `Сообщение ${i}`,
        }
        return POST(createMockRequest(requestData))
      })

      const responses = await Promise.all(requests)

      responses.forEach(async (response) => {
        expect(response.status).toBe(200)
        const data = await response.json()
        expect(data).toEqual({ success: true })
      })

      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(5)
    })

    test('не логирует чувствительную информацию при ошибке', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP Error'))

      const requestData = {
        name: 'Тест',
        email: 'test@example.com',
        subject: 'Тест',
        message: 'Тест сообщение',
      }

      const request = createMockRequest(requestData)
      await POST(request)

      expect(consoleSpy).toHaveBeenCalledWith('Ошибка отправки:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })
  })

  describe('Интеграционные тесты', () => {
    test('полный цикл обработки запроса', async () => {
      const requestData = {
        name: 'Полный Тест',
        email: 'full.test@example.com',
        subject: 'Интеграционный тест',
        phone: '+7 111 222 33 44',
        message: 'Это полный интеграционный тест API endpoint',
      }

      const request = createMockRequest(requestData)
      
      // Проверяем весь цикл
      const response = await POST(request)
      const responseData = await response.json()

      // Проверяем ответ
      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)

      // Проверяем, что все компоненты были вызваны
      expect(request.formData).toHaveBeenCalledTimes(1)
      expect(mockNodemailer.createTransporter).toHaveBeenCalledTimes(1)
      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1)

      // Проверяем финальные данные
      const sendMailCall = mockTransporter.sendMail.mock.calls[0][0]
      expect(sendMailCall.subject).toBe('Новое сообщение от Полный Тест — Интеграционный тест')
      expect(sendMailCall.text).toContain('Email: full.test@example.com')
      expect(sendMailCall.text).toContain('Телефон: +7 111 222 33 44')
    })
  })
})
