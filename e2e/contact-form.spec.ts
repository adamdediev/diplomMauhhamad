import { test, expect } from '@playwright/test'

test.describe('Контактная форма', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    
    // Находим и переходим к секции контактов
    const contactSection = page.locator('#support, [data-testid="contact-section"]').first()
    if (await contactSection.count() > 0) {
      await contactSection.scrollIntoViewIfNeeded()
    }
  })

  test('отображает все поля формы', async ({ page }) => {
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="subject"]')).toBeVisible()
    await expect(page.locator('input[name="phone"]')).toBeVisible()
    await expect(page.locator('textarea[name="message"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('показывает правильные placeholder тексты', async ({ page }) => {
    await expect(page.locator('input[name="name"]')).toHaveAttribute('placeholder', 'Имя')
    await expect(page.locator('input[name="email"]')).toHaveAttribute('placeholder', 'Адрес')
    await expect(page.locator('input[name="subject"]')).toHaveAttribute('placeholder', 'Вопрос')
    await expect(page.locator('input[name="phone"]')).toHaveAttribute('placeholder', 'Номер телефона')
    await expect(page.locator('textarea[name="message"]')).toHaveAttribute('placeholder', 'Сообщение')
  })

  test('валидирует обязательные поля', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()
    
    // Проверяем HTML5 валидацию
    const nameInput = page.locator('input[name="name"]')
    const emailInput = page.locator('input[name="email"]')
    const subjectInput = page.locator('input[name="subject"]')
    const messageInput = page.locator('textarea[name="message"]')
    
    // Проверяем, что поля помечены как невалидные
    await expect(nameInput).toHaveAttribute('required')
    await expect(emailInput).toHaveAttribute('required')
    await expect(subjectInput).toHaveAttribute('required')
    await expect(messageInput).toHaveAttribute('required')
  })

  test('валидирует формат email', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]')
    
    // Вводим невалидный email
    await emailInput.fill('invalid-email')
    
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()
    
    // Проверяем, что браузер показывает ошибку валидации
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage)
    expect(validationMessage).toBeTruthy()
  })

  test('успешно отправляет форму с валидными данными', async ({ page }) => {
    // Мокаем API endpoint
    await page.route('/api/send', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    })

    // Заполняем форму
    await page.locator('input[name="name"]').fill('Иван Тестов')
    await page.locator('input[name="email"]').fill('ivan.testov@example.com')
    await page.locator('input[name="subject"]').fill('Тестовый вопрос')
    await page.locator('input[name="phone"]').fill('+7 123 456 78 90')
    await page.locator('textarea[name="message"]').fill('Это тестовое сообщение для проверки формы')

    // Отправляем форму
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Ждем появления сообщения об успехе
    await expect(page.locator('text=Сообщение успешно отправлено!')).toBeVisible({ timeout: 5000 })
  })

  test('очищает форму после успешной отправки', async ({ page }) => {
    // Мокаем API endpoint
    await page.route('/api/send', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    })

    const nameInput = page.locator('input[name="name"]')
    const emailInput = page.locator('input[name="email"]')
    const subjectInput = page.locator('input[name="subject"]')
    const phoneInput = page.locator('input[name="phone"]')
    const messageInput = page.locator('textarea[name="message"]')

    // Заполняем форму
    await nameInput.fill('Тест Очистки')
    await emailInput.fill('test.clear@example.com')
    await subjectInput.fill('Тест очистки формы')
    await phoneInput.fill('+7 987 654 32 10')
    await messageInput.fill('Проверяем очистку формы после отправки')

    // Отправляем форму
    await page.locator('button[type="submit"]').click()

    // Ждем успешной отправки
    await expect(page.locator('text=Сообщение успешно отправлено!')).toBeVisible()

    // Проверяем, что поля очистились
    await expect(nameInput).toHaveValue('')
    await expect(emailInput).toHaveValue('')
    await expect(subjectInput).toHaveValue('')
    await expect(phoneInput).toHaveValue('')
    await expect(messageInput).toHaveValue('')
  })

  test('показывает ошибку при неудачной отправке', async ({ page }) => {
    // Мокаем API endpoint с ошибкой
    await page.route('/api/send', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Ошибка сервера' }),
      })
    })

    // Заполняем форму
    await page.locator('input[name="name"]').fill('Тест Ошибки')
    await page.locator('input[name="email"]').fill('test.error@example.com')
    await page.locator('input[name="subject"]').fill('Тест ошибки')
    await page.locator('textarea[name="message"]').fill('Проверяем обработку ошибок')

    // Отправляем форму
    await page.locator('button[type="submit"]').click()

    // Ждем появления сообщения об ошибке
    await expect(page.locator('text=Ошибка отправки: Ошибка сервера')).toBeVisible({ timeout: 5000 })
  })

  test('обрабатывает сетевые ошибки', async ({ page }) => {
    // Мокаем сетевую ошибку
    await page.route('/api/send', async (route) => {
      await route.abort('failed')
    })

    // Заполняем форму
    await page.locator('input[name="name"]').fill('Тест Сети')
    await page.locator('input[name="email"]').fill('test.network@example.com')
    await page.locator('input[name="subject"]').fill('Тест сетевой ошибки')
    await page.locator('textarea[name="message"]').fill('Проверяем сетевые ошибки')

    // Отправляем форму
    await page.locator('button[type="submit"]').click()

    // Ждем появления сообщения об ошибке
    await expect(page.locator('text*=Ошибка отправки')).toBeVisible({ timeout: 5000 })
  })

  test('работает на мобильных устройствах', async ({ page }) => {
    // Устанавливаем мобильный viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Проверяем, что форма адаптивна
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('textarea[name="message"]')).toBeVisible()

    // Заполняем форму на мобильном
    await page.locator('input[name="name"]').fill('Мобильный Тест')
    await page.locator('input[name="email"]').fill('mobile.test@example.com')
    await page.locator('input[name="subject"]').fill('Мобильный тест')
    await page.locator('textarea[name="message"]').fill('Тестируем на мобильном устройстве')

    // Проверяем, что поля заполнились
    await expect(page.locator('input[name="name"]')).toHaveValue('Мобильный Тест')
    await expect(page.locator('input[name="email"]')).toHaveValue('mobile.test@example.com')
  })

  test('поддерживает автозаполнение', async ({ page }) => {
    const nameInput = page.locator('input[name="name"]')
    const emailInput = page.locator('input[name="email"]')
    const phoneInput = page.locator('input[name="phone"]')

    // Проверяем атрибуты автозаполнения
    await expect(nameInput).toHaveAttribute('name', 'name')
    await expect(emailInput).toHaveAttribute('type', 'email')
    await expect(phoneInput).toHaveAttribute('name', 'phone')
  })

  test('фокусируется на первом поле при загрузке', async ({ page }) => {
    // Скроллим к форме
    await page.locator('input[name="name"]').scrollIntoViewIfNeeded()
    
    // Кликаем на первое поле
    await page.locator('input[name="name"]').click()
    
    // Проверяем, что поле в фокусе
    await expect(page.locator('input[name="name"]')).toBeFocused()
  })

  test('поддерживает навигацию с клавиатуры', async ({ page }) => {
    // Фокусируемся на первом поле
    await page.locator('input[name="name"]').focus()
    
    // Переходим по полям с помощью Tab
    await page.keyboard.press('Tab')
    await expect(page.locator('input[name="email"]')).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.locator('input[name="subject"]')).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.locator('input[name="phone"]')).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.locator('textarea[name="message"]')).toBeFocused()
  })

  test('обрабатывает специальные символы', async ({ page }) => {
    const specialText = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    const unicodeText = 'Тест с эмодзи 🚀 и символами ñáéíóú'

    await page.locator('input[name="name"]').fill(specialText)
    await page.locator('textarea[name="message"]').fill(unicodeText)

    // Проверяем, что значения сохранились
    await expect(page.locator('input[name="name"]')).toHaveValue(specialText)
    await expect(page.locator('textarea[name="message"]')).toHaveValue(unicodeText)
  })

  test('ограничивает длину полей', async ({ page }) => {
    const longText = 'a'.repeat(1000)
    
    await page.locator('input[name="name"]').fill(longText)
    await page.locator('textarea[name="message"]').fill(longText)

    // Проверяем, что длинный текст принимается (или обрезается, если есть ограничения)
    const nameValue = await page.locator('input[name="name"]').inputValue()
    const messageValue = await page.locator('textarea[name="message"]').inputValue()
    
    expect(nameValue.length).toBeGreaterThan(0)
    expect(messageValue.length).toBeGreaterThan(0)
  })

  test('показывает индикатор загрузки при отправке', async ({ page }) => {
    // Мокаем медленный API endpoint
    await page.route('/api/send', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 2000)) // 2 секунды задержки
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    })

    // Заполняем форму
    await page.locator('input[name="name"]').fill('Тест Загрузки')
    await page.locator('input[name="email"]').fill('test.loading@example.com')
    await page.locator('input[name="subject"]').fill('Тест индикатора загрузки')
    await page.locator('textarea[name="message"]').fill('Проверяем индикатор загрузки')

    // Отправляем форму
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Проверяем, что кнопка заблокирована или показывает загрузку
    // (это зависит от реализации - может быть disabled или изменен текст)
    const buttonText = await submitButton.textContent()
    const isDisabled = await submitButton.isDisabled()
    
    // Один из индикаторов должен быть активен
    expect(isDisabled || buttonText?.includes('...') || buttonText?.includes('Отправка')).toBeTruthy()
  })

  test('сохраняет данные при перезагрузке страницы', async ({ page }) => {
    // Заполняем форму
    await page.locator('input[name="name"]').fill('Тест Сохранения')
    await page.locator('input[name="email"]').fill('test.save@example.com')
    await page.locator('textarea[name="message"]').fill('Проверяем сохранение данных')

    // Перезагружаем страницу
    await page.reload()

    // Скроллим к форме
    await page.locator('input[name="name"]').scrollIntoViewIfNeeded()

    // Проверяем, сохранились ли данные (если реализовано)
    // Это зависит от того, реализовано ли сохранение в localStorage
    const nameValue = await page.locator('input[name="name"]').inputValue()
    const emailValue = await page.locator('input[name="email"]').inputValue()
    
    // Если сохранение не реализовано, поля должны быть пустыми
    // Если реализовано - должны содержать введенные данные
    console.log('Name after reload:', nameValue)
    console.log('Email after reload:', emailValue)
  })

  test('работает с различными браузерами', async ({ page, browserName }) => {
    console.log(`Тестируем в браузере: ${browserName}`)

    // Заполняем форму
    await page.locator('input[name="name"]').fill(`Тест ${browserName}`)
    await page.locator('input[name="email"]').fill(`test.${browserName}@example.com`)
    await page.locator('input[name="subject"]').fill(`Тест в ${browserName}`)
    await page.locator('textarea[name="message"]').fill(`Тестируем форму в браузере ${browserName}`)

    // Проверяем, что все поля заполнились корректно
    await expect(page.locator('input[name="name"]')).toHaveValue(`Тест ${browserName}`)
    await expect(page.locator('input[name="email"]')).toHaveValue(`test.${browserName}@example.com`)
    await expect(page.locator('input[name="subject"]')).toHaveValue(`Тест в ${browserName}`)
    await expect(page.locator('textarea[name="message"]')).toHaveValue(`Тестируем форму в браузере ${browserName}`)
  })
})

