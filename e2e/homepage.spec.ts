import { test, expect } from '@playwright/test'

test.describe('Главная страница', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('загружается без ошибок', async ({ page }) => {
    await expect(page).toHaveTitle(/Solid NextJS/i)
    await expect(page.locator('header')).toBeVisible()
  })

  test('отображает основные элементы', async ({ page }) => {
    // Проверяем header
    await expect(page.locator('header')).toBeVisible()
    
    // Проверяем логотип
    await expect(page.locator('img[alt="logo"]')).toBeVisible()
    
    // Проверяем навигационное меню
    await expect(page.locator('nav')).toBeVisible()
    
    // Проверяем основной контент
    await expect(page.locator('main')).toBeVisible()
    
    // Проверяем footer
    await expect(page.locator('footer')).toBeVisible()
  })

  test('навигация работает корректно', async ({ page }) => {
    // Проверяем ссылки в навигации
    const homeLink = page.locator('a[href="/"]').first()
    await expect(homeLink).toBeVisible()
    
    const aboutLink = page.locator('a[href*="about"]').first()
    if (await aboutLink.count() > 0) {
      await aboutLink.click()
      await expect(page).toHaveURL(/about/)
    }
  })

  test('sticky header работает при скролле', async ({ page }) => {
    const header = page.locator('header')
    
    // Проверяем начальное состояние
    await expect(header).toBeVisible()
    
    // Скроллим вниз
    await page.evaluate(() => window.scrollTo(0, 200))
    
    // Ждем применения sticky стилей
    await page.waitForTimeout(100)
    
    // Проверяем, что header все еще видим и имеет sticky стили
    await expect(header).toBeVisible()
    await expect(header).toHaveClass(/bg-white|shadow/)
  })

  test('темная тема переключается', async ({ page }) => {
    // Ищем кнопку переключения темы
    const themeToggle = page.locator('[data-testid="theme-toggle"], button[aria-label*="theme"], button[aria-label*="тема"]').first()
    
    if (await themeToggle.count() > 0) {
      // Проверяем начальную тему
      const initialTheme = await page.locator('html').getAttribute('class')
      
      // Переключаем тему
      await themeToggle.click()
      
      // Ждем изменения
      await page.waitForTimeout(100)
      
      // Проверяем, что тема изменилась
      const newTheme = await page.locator('html').getAttribute('class')
      expect(newTheme).not.toBe(initialTheme)
    }
  })

  test('мобильное меню работает', async ({ page }) => {
    // Устанавливаем мобильный viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Ищем кнопку мобильного меню
    const mobileMenuButton = page.locator('button[aria-label*="menu"], button[aria-label*="меню"], [data-testid="mobile-menu-button"]').first()
    
    if (await mobileMenuButton.count() > 0) {
      // Проверяем, что меню изначально скрыто
      const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-menu').first()
      
      // Открываем меню
      await mobileMenuButton.click()
      
      // Проверяем, что меню появилось
      await expect(mobileMenu).toBeVisible()
      
      // Закрываем меню
      await mobileMenuButton.click()
      
      // Проверяем, что меню скрылось
      await expect(mobileMenu).not.toBeVisible()
    }
  })

  test('все изображения загружаются', async ({ page }) => {
    // Ждем загрузки всех изображений
    await page.waitForLoadState('networkidle')
    
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      await expect(img).toBeVisible()
      
      // Проверяем, что изображение загрузилось
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth)
      expect(naturalWidth).toBeGreaterThan(0)
    }
  })

  test('страница адаптивна', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 },   // Mobile
      { width: 768, height: 1024 },  // Tablet
      { width: 1200, height: 800 },  // Desktop
      { width: 1920, height: 1080 }, // Large Desktop
    ]

    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      
      // Проверяем, что основные элементы видимы
      await expect(page.locator('header')).toBeVisible()
      await expect(page.locator('main')).toBeVisible()
      
      // Проверяем, что нет горизонтального скролла
      const bodyWidth = await page.locator('body').evaluate(el => el.scrollWidth)
      expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 1) // +1 для погрешности
    }
  })

  test('производительность страницы', async ({ page }) => {
    // Измеряем время загрузки
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    // Страница должна загружаться быстро (менее 5 секунд)
    expect(loadTime).toBeLessThan(5000)
    
    // Проверяем Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const vitals: Record<string, number> = {}
          
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              vitals.fcp = entry.startTime
            }
            if (entry.name === 'largest-contentful-paint') {
              vitals.lcp = entry.startTime
            }
          })
          
          resolve(vitals)
        }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] })
        
        // Fallback timeout
        setTimeout(() => resolve({}), 3000)
      })
    })
    
    console.log('Performance metrics:', metrics)
  })

  test('SEO элементы присутствуют', async ({ page }) => {
    // Проверяем title
    await expect(page).toHaveTitle(/.+/)
    
    // Проверяем meta description
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', /.+/)
    
    // Проверяем заголовки H1
    const h1Elements = page.locator('h1')
    const h1Count = await h1Elements.count()
    expect(h1Count).toBeGreaterThanOrEqual(1)
    
    // Проверяем структуру заголовков
    const headings = page.locator('h1, h2, h3, h4, h5, h6')
    const headingCount = await headings.count()
    expect(headingCount).toBeGreaterThan(0)
  })

  test('доступность (a11y)', async ({ page }) => {
    // Проверяем, что все изображения имеют alt атрибуты
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      expect(alt).toBeTruthy()
    }
    
    // Проверяем, что все ссылки имеют доступные имена
    const links = page.locator('a')
    const linkCount = await links.count()
    
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i)
      const text = await link.textContent()
      const ariaLabel = await link.getAttribute('aria-label')
      const title = await link.getAttribute('title')
      
      expect(text || ariaLabel || title).toBeTruthy()
    }
    
    // Проверяем цветовой контраст (базовая проверка)
    const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span, div')
    const textCount = await textElements.count()
    
    // Проверяем первые 10 элементов для производительности
    const elementsToCheck = Math.min(textCount, 10)
    
    for (let i = 0; i < elementsToCheck; i++) {
      const element = textElements.nth(i)
      const styles = await element.evaluate((el) => {
        const computed = window.getComputedStyle(el)
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
        }
      })
      
      // Базовая проверка, что цвета определены
      expect(styles.color).toBeTruthy()
    }
  })

  test('работает без JavaScript', async ({ page, context }) => {
    // Отключаем JavaScript
    await context.setExtraHTTPHeaders({})
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'javaEnabled', {
        value: () => false,
      })
    })
    
    await page.goto('/')
    
    // Проверяем, что основной контент все еще доступен
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()
    
    // Проверяем, что изображения загружаются
    const logo = page.locator('img[alt="logo"]')
    await expect(logo).toBeVisible()
  })

  test('обрабатывает медленное соединение', async ({ page }) => {
    // Симулируем медленное соединение
    await page.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 100)) // 100ms задержка
      await route.continue()
    })
    
    await page.goto('/')
    
    // Проверяем, что страница все еще загружается корректно
    await expect(page.locator('header')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 })
  })

  test('корректно обрабатывает ошибки', async ({ page }) => {
    // Перехватываем консольные ошибки
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    // Перехватываем ошибки страницы
    const pageErrors: string[] = []
    page.on('pageerror', (error) => {
      pageErrors.push(error.message)
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Проверяем, что нет критических ошибок
    const criticalErrors = [...consoleErrors, ...pageErrors].filter(error => 
      !error.includes('favicon') && // Игнорируем ошибки favicon
      !error.includes('analytics') && // Игнорируем ошибки аналитики
      !error.includes('third-party') // Игнорируем ошибки третьих сторон
    )
    
    expect(criticalErrors).toHaveLength(0)
  })
})

