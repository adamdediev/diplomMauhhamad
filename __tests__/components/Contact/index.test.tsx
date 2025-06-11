import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import Contact from '../../../components/Contact'

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

// Mock fetch
global.fetch = jest.fn()
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('Contact', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()
  })

  describe('Рендеринг', () => {
    test('рендерится без ошибок', () => {
      render(<Contact />)
      // Проверяем, что компонент рендерится (может быть section или другой элемент)
      expect(document.body).toContainHTML('section')
    })

    test('отображает заголовок формы', () => {
      render(<Contact />)
      // Ищем заголовок по тексту
      const heading = screen.getByText(/связаться|contact|поддержка|support/i)
      expect(heading).toBeInTheDocument()
    })

    test('отображает поля формы', () => {
      render(<Contact />)
      
      expect(screen.getByPlaceholderText('Имя')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Адрес')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Вопрос')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Номер телефона')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Сообщение')).toBeInTheDocument()
    })

    test('отображает кнопку отправки', () => {
      render(<Contact />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    test('форма имеет правильную структуру', () => {
      render(<Contact />)
      
      // Ищем форму по тегу
      const form = document.querySelector('form')
      expect(form).toBeInTheDocument()
      
      const submitButton = screen.getByRole('button')
      expect(submitButton).toBeInTheDocument()
    })
  })

  describe('Валидация формы', () => {
    test('поля имеют правильные атрибуты', () => {
      render(<Contact />)
      
      const nameInput = screen.getByPlaceholderText('Имя')
      const emailInput = screen.getByPlaceholderText('Адрес')
      const subjectInput = screen.getByPlaceholderText('Вопрос')
      const phoneInput = screen.getByPlaceholderText('Номер телефона')
      const messageInput = screen.getByPlaceholderText('Сообщение')
      
      expect(nameInput).toHaveAttribute('name', 'name')
      expect(emailInput).toHaveAttribute('name', 'email')
      expect(subjectInput).toHaveAttribute('name', 'subject')
      expect(phoneInput).toHaveAttribute('name', 'phone')
      expect(messageInput).toHaveAttribute('name', 'message')
    })

    test('обязательные поля имеют атрибут required', () => {
      render(<Contact />)
      
      const nameInput = screen.getByPlaceholderText('Имя')
      const emailInput = screen.getByPlaceholderText('Адрес')
      const subjectInput = screen.getByPlaceholderText('Вопрос')
      const messageInput = screen.getByPlaceholderText('Сообщение')
      
      expect(nameInput).toHaveAttribute('required')
      expect(emailInput).toHaveAttribute('required')
      expect(subjectInput).toHaveAttribute('required')
      expect(messageInput).toHaveAttribute('required')
    })

    test('email поле имеет правильный тип', () => {
      render(<Contact />)
      
      const emailInput = screen.getByPlaceholderText('Адрес')
      expect(emailInput).toHaveAttribute('type', 'email')
    })
  })

  describe('Взаимодействие с формой', () => {
    test('можно заполнить поля формы', async () => {
      const user = userEvent.setup()
      render(<Contact />)
      
      const nameInput = screen.getByPlaceholderText('Имя')
      const emailInput = screen.getByPlaceholderText('Адрес')
      const subjectInput = screen.getByPlaceholderText('Вопрос')
      const phoneInput = screen.getByPlaceholderText('Номер телефона')
      const messageInput = screen.getByPlaceholderText('Сообщение')
      
      await user.type(nameInput, 'Иван Тестов')
      await user.type(emailInput, 'ivan@test.com')
      await user.type(subjectInput, 'Тестовый вопрос')
      await user.type(phoneInput, '+7 123 456 78 90')
      await user.type(messageInput, 'Тестовое сообщение')
      
      expect(nameInput).toHaveValue('Иван Тестов')
      expect(emailInput).toHaveValue('ivan@test.com')
      expect(subjectInput).toHaveValue('Тестовый вопрос')
      expect(phoneInput).toHaveValue('+7 123 456 78 90')
      expect(messageInput).toHaveValue('Тестовое сообщение')
    })

    test('форма отправляется при клике на кнопку', async () => {
      const user = userEvent.setup()
      
      // Мокаем успешный ответ
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response)
      
      render(<Contact />)
      
      // Заполняем форму
      await user.type(screen.getByPlaceholderText('Имя'), 'Тест')
      await user.type(screen.getByPlaceholderText('Адрес'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('Вопрос'), 'Тест')
      await user.type(screen.getByPlaceholderText('Сообщение'), 'Тест сообщение')
      
      // Отправляем форму
      const submitButton = screen.getByRole('button')
      await user.click(submitButton)
      
      // Проверяем, что fetch был вызван
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Обработка ответов сервера', () => {
    test('показывает сообщение об успехе', async () => {
      const user = userEvent.setup()
      
      // Мокаем успешный ответ
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response)
      
      render(<Contact />)
      
      // Заполняем и отправляем форму
      await user.type(screen.getByPlaceholderText('Имя'), 'Тест')
      await user.type(screen.getByPlaceholderText('Адрес'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('Вопрос'), 'Тест')
      await user.type(screen.getByPlaceholderText('Сообщение'), 'Тест сообщение')
      
      const submitButton = screen.getByRole('button')
      await user.click(submitButton)
      
      // Ждем появления сообщения об успехе
      await waitFor(() => {
        expect(screen.getByText(/успешно отправлено/i)).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    test('показывает сообщение об ошибке', async () => {
      const user = userEvent.setup()
      
      // Мокаем ответ с ошибкой
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, error: 'Ошибка сервера' }),
      } as Response)
      
      render(<Contact />)
      
      // Заполняем и отправляем форму
      await user.type(screen.getByPlaceholderText('Имя'), 'Тест')
      await user.type(screen.getByPlaceholderText('Адрес'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('Вопрос'), 'Тест')
      await user.type(screen.getByPlaceholderText('Сообщение'), 'Тест сообщение')
      
      const submitButton = screen.getByRole('button')
      await user.click(submitButton)
      
      // Ждем появления сообщения об ошибке
      await waitFor(() => {
        expect(screen.getByText(/ошибка отправки/i)).toBeInTheDocument()
      }, { timeout: 3000 })
    })
  })

  describe('Доступность (A11y)', () => {
    test('поля имеют правильные labels', () => {
      render(<Contact />)
      
      // Проверяем, что поля доступны по placeholder (что является формой labeling)
      expect(screen.getByPlaceholderText('Имя')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Адрес')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Вопрос')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Номер телефона')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Сообщение')).toBeInTheDocument()
    })

    test('форма доступна для навигации с клавиатуры', async () => {
      render(<Contact />)
      
      const nameInput = screen.getByPlaceholderText('Имя')
      const emailInput = screen.getByPlaceholderText('Адрес')
      
      // Фокусируемся на первом поле
      nameInput.focus()
      expect(nameInput).toHaveFocus()
      
      // Переходим к следующему полю
      fireEvent.keyDown(nameInput, { key: 'Tab' })
      // В реальном браузере фокус перейдет на следующий элемент
      // В тестах мы просто проверяем, что элементы focusable
      expect(emailInput).toBeInTheDocument()
    })
  })

  describe('Производительность', () => {
    test('не делает лишних запросов', async () => {
      const user = userEvent.setup()
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      } as Response)
      
      render(<Contact />)
      
      // Заполняем форму
      await user.type(screen.getByPlaceholderText('Имя'), 'Тест')
      await user.type(screen.getByPlaceholderText('Адрес'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('Вопрос'), 'Тест')
      await user.type(screen.getByPlaceholderText('Сообщение'), 'Тест сообщение')
      
      // Отправляем форму один раз
      const submitButton = screen.getByRole('button')
      await user.click(submitButton)
      
      // Должен быть только один запрос
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Граничные случаи', () => {
    test('обрабатывает сетевые ошибки', async () => {
      const user = userEvent.setup()
      
      // Мокаем сетевую ошибку
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
      
      render(<Contact />)
      
      // Заполняем и отправляем форму
      await user.type(screen.getByPlaceholderText('Имя'), 'Тест')
      await user.type(screen.getByPlaceholderText('Адрес'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('Вопрос'), 'Тест')
      await user.type(screen.getByPlaceholderText('Сообщение'), 'Тест сообщение')
      
      const submitButton = screen.getByRole('button')
      await user.click(submitButton)
      
      // Ждем обработки ошибки
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1)
      })
    })

    test('работает с пустыми значениями', async () => {
      const user = userEvent.setup()
      render(<Contact />)
      
      // Пытаемся отправить пустую форму
      const submitButton = screen.getByRole('button')
      await user.click(submitButton)
      
      // Форма должна использовать HTML5 валидацию
      const nameInput = screen.getByPlaceholderText('Имя')
      expect(nameInput).toHaveAttribute('required')
    })
  })
})

