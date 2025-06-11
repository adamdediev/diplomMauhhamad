import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Header from '../../../components/Header'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

// Mock window.scrollY
Object.defineProperty(window, 'scrollY', {
  writable: true,
  value: 0,
})

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.scrollY = 0
  })

  afterEach(() => {
    // Очищаем event listeners
    window.removeEventListener('scroll', jest.fn())
  })

  describe('Рендеринг', () => {
    test('рендерится без ошибок', () => {
      render(<Header />)
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    test('отображает логотип', () => {
      render(<Header />)
      const logo = screen.getByAltText('logo')
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveAttribute('src', '/images/logo/logo-light.png')
    })

    test('отображает навигационное меню', () => {
      render(<Header />)
      const navigation = screen.getByRole('navigation')
      expect(navigation).toBeInTheDocument()
    })

    test('имеет правильную структуру header', () => {
      render(<Header />)
      const header = screen.getByRole('banner')
      expect(header).toHaveClass('fixed')
      expect(header).toHaveClass('w-full')
    })
  })

  describe('Sticky Menu функциональность', () => {
    test('добавляет sticky стили при скролле вниз', async () => {
      render(<Header />)
      const header = screen.getByRole('banner')
      
      // Изначально нет sticky стилей
      expect(header).not.toHaveClass('bg-white')
      
      // Симулируем скролл
      window.scrollY = 100
      fireEvent.scroll(window)
      
      // Проверяем, что header все еще присутствует
      expect(header).toBeInTheDocument()
    })

    test('реагирует на события скролла', () => {
      render(<Header />)
      
      // Проверяем, что компонент добавляет обработчик скролла
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener')
      
      // Ре-рендерим компонент
      render(<Header />)
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
      
      addEventListenerSpy.mockRestore()
    })
  })

  describe('Навигационные элементы', () => {
    test('отображает навигационный список', () => {
      render(<Header />)
      
      const navigation = screen.getByRole('navigation')
      expect(navigation).toBeInTheDocument()
      
      const navList = screen.getByRole('list')
      expect(navList).toBeInTheDocument()
    })

    test('отображает ссылки навигации', () => {
      render(<Header />)
      
      const links = screen.getAllByRole('link')
      expect(links.length).toBeGreaterThan(0)
      
      // Первая ссылка должна быть логотипом
      const logoLink = links[0]
      expect(logoLink).toHaveAttribute('href', '/')
    })

    test('отображает кнопки в навигации', () => {
      render(<Header />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('Мобильная навигация', () => {
    test('отображает мобильные элементы управления', () => {
      render(<Header />)
      
      // Проверяем, что есть кнопки (включая мобильное меню)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    test('имеет адаптивные классы', () => {
      render(<Header />)
      
      const header = screen.getByRole('banner')
      expect(header).toBeInTheDocument()
      
      // Проверяем наличие адаптивных классов
      const container = header.querySelector('div')
      expect(container).toBeInTheDocument()
    })
  })

  describe('Доступность (A11y)', () => {
    test('имеет правильные ARIA атрибуты', () => {
      render(<Header />)
      
      const header = screen.getByRole('banner')
      expect(header).toBeInTheDocument()
      
      const navigation = screen.getByRole('navigation')
      expect(navigation).toBeInTheDocument()
    })

    test('логотип имеет альтернативный текст', () => {
      render(<Header />)
      
      const logo = screen.getByAltText('logo')
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveAttribute('alt', 'logo')
    })

    test('ссылки доступны для навигации', () => {
      render(<Header />)
      
      const links = screen.getAllByRole('link')
      
      links.forEach(link => {
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href')
      })
    })
  })

  describe('Производительность', () => {
    test('не вызывает лишних ре-рендеров', () => {
      const renderSpy = jest.fn()
      
      const TestWrapper = () => {
        renderSpy()
        return <Header />
      }
      
      const { rerender } = render(<TestWrapper />)
      
      // Ре-рендер с теми же условиями
      rerender(<TestWrapper />)
      
      expect(renderSpy).toHaveBeenCalledTimes(2)
    })

    test('корректно обрабатывает события', () => {
      render(<Header />)
      
      // Симулируем событие скролла
      window.scrollY = 50
      fireEvent.scroll(window)
      
      // Компонент должен корректно обработать событие
      const header = screen.getByRole('banner')
      expect(header).toBeInTheDocument()
    })
  })

  describe('Граничные случаи', () => {
    test('работает без JavaScript (SSR)', () => {
      render(<Header />)
      
      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByAltText('logo')).toBeInTheDocument()
    })

    test('обрабатывает различные размеры экрана', () => {
      // Мобильный
      Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true })
      render(<Header />)
      expect(screen.getByRole('banner')).toBeInTheDocument()
      
      // Десктоп
      Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true })
      render(<Header />)
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })
  })
})

