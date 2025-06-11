# 🧪 Нейросетевое тестирование

Этот проект использует комплексную систему тестирования с применением искусственного интеллекта для автоматической генерации и анализа тестов.

## 🚀 Быстрый старт

```bash
# Установка зависимостей
npm install

# Установка Playwright браузеров
npm run playwright:install

# Запуск всех тестов
npm run test:all
```

## 📋 Типы тестов

### 🔬 Unit тесты
Тестируют отдельные компоненты и функции в изоляции.

```bash
# Запуск unit тестов
npm run test

# Запуск с отслеживанием изменений
npm run test:watch

# Запуск с отчетом покрытия
npm run test:coverage
```

**Покрывают:**
- React компоненты (рендеринг, props, состояние)
- Пользовательские взаимодействия
- Обработка ошибок
- Доступность (a11y)

### 🔗 Integration тесты
Тестируют взаимодействие между компонентами и API.

```bash
# Запуск integration тестов
npm run test -- --testPathPattern=api
```

**Покрывают:**
- API endpoints
- Интеграция с внешними сервисами
- Обработка данных форм
- Валидация и безопасность

### 🎭 End-to-End тесты
Тестируют полные пользовательские сценарии в браузере.

```bash
# Запуск E2E тестов
npm run test:e2e

# Запуск с UI интерфейсом
npm run test:e2e:ui

# Запуск в видимом браузере
npm run test:e2e:headed
```

**Покрывают:**
- Полные пользовательские пути
- Кроссбраузерное тестирование
- Адаптивность
- Производительность

## 🤖 AI-генерация тестов

### Автоматическая генерация
Система анализирует ваши компоненты и автоматически создает тесты.

```bash
# Генерация тестов для всех компонентов
npm run test:generate

# Обновление существующих тестов
npm run test:update

# Анализ качества тестов
npm run test:analyze
```

### Настройка AI
1. Получите API ключ от OpenAI
2. Добавьте в `.env.local`:
```bash
OPENAI_API_KEY=your_api_key_here
```

### Возможности AI
- 🧠 Анализ сложности компонентов
- 📝 Генерация comprehensive тестов
- 🔍 Выявление пробелов в покрытии
- 💡 Рекомендации по улучшению
- 🔄 Автоматическое обновление тестов

## 📊 Отчеты и метрики

### Покрытие кода
```bash
npm run test:coverage
```
Генерирует отчеты в папке `coverage/`:
- HTML отчет: `coverage/lcov-report/index.html`
- JSON данные: `coverage/coverage-final.json`

### AI анализ
```bash
npm run test:analyze
```
Создает отчеты:
- `component-analysis-report.json` - анализ компонентов
- `test-quality-report.json` - качество тестов

### Производительность
E2E тесты включают проверки:
- Core Web Vitals
- Время загрузки
- Размер бандла
- Lighthouse метрики

## 🛠️ Конфигурация

### Jest (Unit/Integration)
Конфигурация в `jest.config.js`:
- Поддержка Next.js 15
- TypeScript
- Моки для внешних библиотек
- Покрытие кода

### Playwright (E2E)
Конфигурация в `playwright.config.ts`:
- Мультибраузерное тестирование
- Мобильные устройства
- Скриншоты и видео при ошибках
- Параллельное выполнение

### AI генератор
Конфигурация в `scripts/ai-test-generator.ts`:
- Анализ компонентов
- Шаблоны тестов
- OpenAI интеграция
- Качество кода

## 🔧 Настройка среды

### Локальная разработка
```bash
# Установка зависимостей
npm install

# Копирование переменных окружения
cp .env.test .env.local

# Запуск в режиме разработки
npm run dev
```

### CI/CD
GitHub Actions автоматически:
- ✅ Запускает все типы тестов
- 📊 Генерирует отчеты покрытия
- 🤖 Анализирует код с помощью AI
- 🔒 Проверяет безопасность
- ⚡ Тестирует производительность

## 📝 Написание тестов

### Unit тесты
```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MyComponent from './MyComponent'

describe('MyComponent', () => {
  test('рендерится без ошибок', () => {
    render(<MyComponent />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  test('обрабатывает клики', async () => {
    const user = userEvent.setup()
    const mockClick = jest.fn()
    
    render(<MyComponent onClick={mockClick} />)
    await user.click(screen.getByRole('button'))
    
    expect(mockClick).toHaveBeenCalled()
  })
})
```

### E2E тесты
```typescript
import { test, expect } from '@playwright/test'

test('пользователь может отправить форму', async ({ page }) => {
  await page.goto('/')
  
  await page.fill('input[name="name"]', 'Тест')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.click('button[type="submit"]')
  
  await expect(page.locator('text=Успешно отправлено')).toBeVisible()
})
```

## 🎯 Лучшие практики

### Структура тестов
- 📁 `__tests__/` - unit и integration тесты
- 📁 `e2e/` - end-to-end тесты
- 📁 `scripts/` - AI инструменты

### Именование
- Описательные названия тестов
- Группировка в `describe` блоки
- Использование русского языка для читаемости

### Моки и заглушки
- Мокирование внешних зависимостей
- Изоляция тестируемого кода
- Предсказуемые результаты

### Доступность
- Тестирование с помощью screen readers
- Проверка ARIA атрибутов
- Навигация с клавиатуры

## 🚨 Устранение проблем

### Частые ошибки
1. **Тесты падают локально**
   ```bash
   # Очистка кэша
   npm run test -- --clearCache
   
   # Обновление снапшотов
   npm run test -- --updateSnapshot
   ```

2. **E2E тесты не запускаются**
   ```bash
   # Переустановка браузеров
   npx playwright install --force
   ```

3. **AI генерация не работает**
   - Проверьте API ключ OpenAI
   - Убедитесь в наличии интернета
   - Проверьте лимиты API

### Отладка
```bash
# Запуск конкретного теста
npm run test -- MyComponent.test.tsx

# Отладка E2E тестов
npm run test:e2e:headed

# Подробный вывод
npm run test -- --verbose
```

## 📚 Дополнительные ресурсы

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## 🤝 Вклад в проект

1. Добавляйте тесты для новых компонентов
2. Обновляйте существующие тесты при изменениях
3. Используйте AI генератор для ускорения
4. Следите за покрытием кода (цель: >80%)
5. Документируйте сложные тестовые сценарии

---

**Помните:** Хорошие тесты - это инвестиция в качество и надежность вашего приложения! 🚀

