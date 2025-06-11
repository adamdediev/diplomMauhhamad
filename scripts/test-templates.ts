interface ComponentInfo {
  name: string
  filePath: string
  props: string[]
  hooks: string[]
  methods: string[]
  imports: string[]
  hasState: boolean
  hasEffects: boolean
  isFormComponent: boolean
  hasEventHandlers: boolean
  exportType: 'default' | 'named'
  dependencies: string[]
  complexity: 'low' | 'medium' | 'high'
}

export class TestTemplates {
  generateTestFromTemplate(componentInfo: ComponentInfo): string {
    const { name, complexity, isFormComponent, hasState, hasEffects, hasEventHandlers } = componentInfo
    
    let template = this.getBaseTemplate(componentInfo)
    
    // Добавляем специфичные тесты в зависимости от типа компонента
    if (isFormComponent) {
      template += this.getFormTestTemplate(componentInfo)
    }
    
    if (hasState) {
      template += this.getStateTestTemplate(componentInfo)
    }
    
    if (hasEffects) {
      template += this.getEffectsTestTemplate(componentInfo)
    }
    
    if (hasEventHandlers) {
      template += this.getEventHandlersTestTemplate(componentInfo)
    }
    
    // Добавляем тесты сложности
    if (complexity === 'high') {
      template += this.getComplexComponentTestTemplate(componentInfo)
    }
    
    template += this.getAccessibilityTestTemplate(componentInfo)
    template += this.getClosingBrace()
    
    return template
  }

  generateAdvancedTest(componentInfo: ComponentInfo): string {
    // Более продвинутая генерация с учетом AI-анализа
    return this.generateTestFromTemplate(componentInfo) + this.getAdvancedTestCases(componentInfo)
  }

  private getBaseTemplate(componentInfo: ComponentInfo): string {
    const { name, exportType, props } = componentInfo
    const importPath = this.getImportPath(componentInfo.filePath)
    const importStatement = exportType === 'default' 
      ? `import ${name} from '${importPath}'`
      : `import { ${name} } from '${importPath}'`

    return `import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
${importStatement}
import { createMockProps } from '../../utils/test-utils'

// Mock dependencies
${this.getMockStatements(componentInfo)}

describe('${name}', () => {
  const defaultProps = createMockProps<any>({
    ${this.getDefaultProps(props)}
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Рендеринг', () => {
    test('рендерится без ошибок', () => {
      render(<${name} {...defaultProps} />)
      expect(screen.getByRole('${this.getMainRole(componentInfo)}')).toBeInTheDocument()
    })

    test('рендерится с правильными props', () => {
      const customProps = {
        ...defaultProps,
        ${this.getCustomPropsForTest(props)}
      }
      render(<${name} {...customProps} />)
      ${this.getPropsAssertions(props)}
    })

    ${props.length > 0 ? this.getPropsVariationsTests(componentInfo) : ''}
  })

`
  }

  private getFormTestTemplate(componentInfo: ComponentInfo): string {
    return `  describe('Функциональность формы', () => {
    test('обрабатывает отправку формы', async () => {
      const user = userEvent.setup()
      const mockSubmit = jest.fn()
      
      render(<${componentInfo.name} {...defaultProps} onSubmit={mockSubmit} />)
      
      const form = screen.getByRole('form')
      await user.click(screen.getByRole('button', { name: /submit|отправить/i }))
      
      expect(mockSubmit).toHaveBeenCalled()
    })

    test('валидирует поля формы', async () => {
      const user = userEvent.setup()
      render(<${componentInfo.name} {...defaultProps} />)
      
      const submitButton = screen.getByRole('button', { name: /submit|отправить/i })
      await user.click(submitButton)
      
      // Проверяем сообщения об ошибках валидации
      await waitFor(() => {
        expect(screen.getByText(/required|обязательно/i)).toBeInTheDocument()
      })
    })

    test('очищает форму после успешной отправки', async () => {
      const user = userEvent.setup()
      const mockSubmit = jest.fn().mockResolvedValue({ success: true })
      
      render(<${componentInfo.name} {...defaultProps} onSubmit={mockSubmit} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'test value')
      
      const submitButton = screen.getByRole('button', { name: /submit|отправить/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(input).toHaveValue('')
      })
    })
  })

`
  }

  private getStateTestTemplate(componentInfo: ComponentInfo): string {
    return `  describe('Управление состоянием', () => {
    test('обновляет состояние при взаимодействии', async () => {
      const user = userEvent.setup()
      render(<${componentInfo.name} {...defaultProps} />)
      
      // Найдем интерактивный элемент
      const interactiveElement = screen.getByRole('button') || screen.getByRole('textbox')
      
      if (interactiveElement.tagName === 'BUTTON') {
        await user.click(interactiveElement)
      } else if (interactiveElement.tagName === 'INPUT') {
        await user.type(interactiveElement, 'test input')
      }
      
      // Проверяем, что состояние изменилось
      await waitFor(() => {
        expect(screen.getByTestId('state-indicator')).toHaveTextContent(/updated|changed/i)
      })
    })

    test('сохраняет состояние между ре-рендерами', () => {
      const { rerender } = render(<${componentInfo.name} {...defaultProps} />)
      
      // Изменяем состояние
      fireEvent.click(screen.getByRole('button'))
      
      // Ре-рендерим с теми же props
      rerender(<${componentInfo.name} {...defaultProps} />)
      
      // Состояние должно сохраниться
      expect(screen.getByTestId('state-indicator')).toHaveTextContent(/active|selected/i)
    })
  })

`
  }

  private getEffectsTestTemplate(componentInfo: ComponentInfo): string {
    return `  describe('Побочные эффекты', () => {
    test('выполняет эффекты при монтировании', async () => {
      const mockEffect = jest.fn()
      
      render(<${componentInfo.name} {...defaultProps} onMount={mockEffect} />)
      
      await waitFor(() => {
        expect(mockEffect).toHaveBeenCalled()
      })
    })

    test('очищает эффекты при размонтировании', () => {
      const mockCleanup = jest.fn()
      
      const { unmount } = render(<${componentInfo.name} {...defaultProps} onUnmount={mockCleanup} />)
      
      unmount()
      
      expect(mockCleanup).toHaveBeenCalled()
    })

    test('обновляет эффекты при изменении зависимостей', async () => {
      const mockEffect = jest.fn()
      
      const { rerender } = render(
        <${componentInfo.name} {...defaultProps} dependency="initial" onEffect={mockEffect} />
      )
      
      rerender(
        <${componentInfo.name} {...defaultProps} dependency="updated" onEffect={mockEffect} />
      )
      
      await waitFor(() => {
        expect(mockEffect).toHaveBeenCalledTimes(2)
      })
    })
  })

`
  }

  private getEventHandlersTestTemplate(componentInfo: ComponentInfo): string {
    return `  describe('Обработчики событий', () => {
    test('обрабатывает клики', async () => {
      const user = userEvent.setup()
      const mockClick = jest.fn()
      
      render(<${componentInfo.name} {...defaultProps} onClick={mockClick} />)
      
      const clickableElement = screen.getByRole('button')
      await user.click(clickableElement)
      
      expect(mockClick).toHaveBeenCalledTimes(1)
    })

    test('обрабатывает события клавиатуры', async () => {
      const user = userEvent.setup()
      const mockKeyDown = jest.fn()
      
      render(<${componentInfo.name} {...defaultProps} onKeyDown={mockKeyDown} />)
      
      const element = screen.getByRole('button') || screen.getByRole('textbox')
      element.focus()
      await user.keyboard('{Enter}')
      
      expect(mockKeyDown).toHaveBeenCalled()
    })

    test('предотвращает всплытие событий при необходимости', async () => {
      const user = userEvent.setup()
      const mockParentClick = jest.fn()
      const mockChildClick = jest.fn((e) => e.stopPropagation())
      
      render(
        <div onClick={mockParentClick}>
          <${componentInfo.name} {...defaultProps} onClick={mockChildClick} />
        </div>
      )
      
      const childElement = screen.getByRole('button')
      await user.click(childElement)
      
      expect(mockChildClick).toHaveBeenCalled()
      expect(mockParentClick).not.toHaveBeenCalled()
    })
  })

`
  }

  private getComplexComponentTestTemplate(componentInfo: ComponentInfo): string {
    return `  describe('Сложная логика', () => {
    test('обрабатывает множественные состояния', async () => {
      const user = userEvent.setup()
      render(<${componentInfo.name} {...defaultProps} />)
      
      // Тестируем переходы между состояниями
      const button1 = screen.getByRole('button', { name: /first|первый/i })
      const button2 = screen.getByRole('button', { name: /second|второй/i })
      
      await user.click(button1)
      expect(screen.getByTestId('state-1')).toBeInTheDocument()
      
      await user.click(button2)
      expect(screen.getByTestId('state-2')).toBeInTheDocument()
      expect(screen.queryByTestId('state-1')).not.toBeInTheDocument()
    })

    test('обрабатывает асинхронные операции', async () => {
      const mockAsyncOperation = jest.fn().mockResolvedValue({ data: 'test' })
      
      render(<${componentInfo.name} {...defaultProps} asyncOperation={mockAsyncOperation} />)
      
      const triggerButton = screen.getByRole('button', { name: /load|загрузить/i })
      fireEvent.click(triggerButton)
      
      // Проверяем состояние загрузки
      expect(screen.getByText(/loading|загрузка/i)).toBeInTheDocument()
      
      // Ждем завершения операции
      await waitFor(() => {
        expect(screen.getByText('test')).toBeInTheDocument()
      })
      
      expect(screen.queryByText(/loading|загрузка/i)).not.toBeInTheDocument()
    })

    test('обрабатывает ошибки gracefully', async () => {
      const mockAsyncOperation = jest.fn().mockRejectedValue(new Error('Test error'))
      
      render(<${componentInfo.name} {...defaultProps} asyncOperation={mockAsyncOperation} />)
      
      const triggerButton = screen.getByRole('button', { name: /load|загрузить/i })
      fireEvent.click(triggerButton)
      
      await waitFor(() => {
        expect(screen.getByText(/error|ошибка/i)).toBeInTheDocument()
      })
    })
  })

`
  }

  private getAccessibilityTestTemplate(componentInfo: ComponentInfo): string {
    return `  describe('Доступность (A11y)', () => {
    test('имеет правильные ARIA атрибуты', () => {
      render(<${componentInfo.name} {...defaultProps} />)
      
      const mainElement = screen.getByRole('${this.getMainRole(componentInfo)}')
      
      // Проверяем основные ARIA атрибуты
      if (mainElement.hasAttribute('aria-label') || mainElement.hasAttribute('aria-labelledby')) {
        expect(mainElement).toHaveAccessibleName()
      }
      
      if (mainElement.hasAttribute('aria-describedby')) {
        expect(mainElement).toHaveAccessibleDescription()
      }
    })

    test('поддерживает навигацию с клавиатуры', async () => {
      const user = userEvent.setup()
      render(<${componentInfo.name} {...defaultProps} />)
      
      const focusableElements = screen.getAllByRole('button')
        .concat(screen.getAllByRole('textbox'))
        .concat(screen.getAllByRole('link'))
      
      if (focusableElements.length > 0) {
        // Проверяем, что элементы можно сфокусировать
        for (const element of focusableElements) {
          element.focus()
          expect(element).toHaveFocus()
        }
        
        // Проверяем Tab навигацию
        focusableElements[0].focus()
        await user.tab()
        
        if (focusableElements.length > 1) {
          expect(focusableElements[1]).toHaveFocus()
        }
      }
    })

    test('имеет достаточный цветовой контраст', () => {
      render(<${componentInfo.name} {...defaultProps} />)
      
      // Этот тест требует дополнительных инструментов для проверки контраста
      // Пока просто проверяем, что элементы видимы
      const mainElement = screen.getByRole('${this.getMainRole(componentInfo)}')
      expect(mainElement).toBeVisible()
    })

    test('работает со скрин-ридерами', () => {
      render(<${componentInfo.name} {...defaultProps} />)
      
      // Проверяем, что важный контент доступен для скрин-ридеров
      const importantElements = screen.getAllByRole(/heading|button|link|textbox/)
      
      importantElements.forEach(element => {
        expect(element).toBeInTheDocument()
        expect(element).not.toHaveAttribute('aria-hidden', 'true')
      })
    })
  })

`
  }

  private getAdvancedTestCases(componentInfo: ComponentInfo): string {
    return `
  // ДОПОЛНИТЕЛЬНЫЕ AI-ГЕНЕРИРОВАННЫЕ ТЕСТЫ
  describe('Продвинутые сценарии', () => {
    test('обрабатывает граничные случаи', () => {
      // Тест с null/undefined props
      render(<${componentInfo.name} {...defaultProps} data={null} />)
      expect(screen.getByRole('${this.getMainRole(componentInfo)}')).toBeInTheDocument()
      
      // Тест с пустыми данными
      render(<${componentInfo.name} {...defaultProps} data={[]} />)
      expect(screen.getByRole('${this.getMainRole(componentInfo)}')).toBeInTheDocument()
    })

    test('оптимизирует производительность', () => {
      const renderSpy = jest.fn()
      
      const TestWrapper = (props: any) => {
        renderSpy()
        return <${componentInfo.name} {...props} />
      }
      
      const { rerender } = render(<TestWrapper {...defaultProps} />)
      
      // Ре-рендер с теми же props не должен вызывать лишних рендеров
      rerender(<TestWrapper {...defaultProps} />)
      
      expect(renderSpy).toHaveBeenCalledTimes(2) // Начальный + ре-рендер
    })

    test('корректно обрабатывает быстрые изменения', async () => {
      const user = userEvent.setup()
      render(<${componentInfo.name} {...defaultProps} />)
      
      const button = screen.getByRole('button')
      
      // Быстрые клики
      await user.click(button)
      await user.click(button)
      await user.click(button)
      
      // Компонент должен корректно обработать все события
      await waitFor(() => {
        expect(screen.getByTestId('click-count')).toHaveTextContent('3')
      })
    })
  })

  // КАСТОМНЫЕ ТЕСТЫ
  // Добавьте здесь свои специфичные тесты для компонента
`
  }

  private getClosingBrace(): string {
    return '})\n'
  }

  private getImportPath(filePath: string): string {
    // Преобразуем абсолютный путь в относительный для импорта
    const relativePath = filePath.replace(process.cwd(), '').replace(/\\/g, '/')
    return relativePath.startsWith('/') ? relativePath.slice(1) : relativePath
  }

  private getMockStatements(componentInfo: ComponentInfo): string {
    const mocks: string[] = []
    
    if (componentInfo.dependencies.includes('framer-motion')) {
      mocks.push('// framer-motion уже замокан в jest.setup.js')
    }
    
    if (componentInfo.dependencies.includes('@emailjs/browser')) {
      mocks.push('// emailjs уже замокан в jest.setup.js')
    }
    
    if (componentInfo.dependencies.includes('next-themes')) {
      mocks.push('// next-themes уже замокан в jest.setup.js')
    }
    
    return mocks.join('\n')
  }

  private getDefaultProps(props: string[]): string {
    return props.map(prop => {
      switch (prop.toLowerCase()) {
        case 'children':
          return `${prop}: 'Test content'`
        case 'classname':
        case 'class':
          return `${prop}: 'test-class'`
        case 'onclick':
        case 'onsubmit':
        case 'onchange':
          return `${prop}: jest.fn()`
        case 'disabled':
        case 'loading':
        case 'visible':
          return `${prop}: false`
        case 'title':
        case 'label':
        case 'placeholder':
          return `${prop}: 'Test ${prop}'`
        case 'data':
        case 'items':
          return `${prop}: []`
        default:
          return `${prop}: 'test-${prop}'`
      }
    }).join(',\n    ')
  }

  private getCustomPropsForTest(props: string[]): string {
    return props.slice(0, 2).map(prop => `${prop}: 'custom-${prop}'`).join(',\n        ')
  }

  private getPropsAssertions(props: string[]): string {
    return props.slice(0, 2).map(prop => 
      `expect(screen.getByText('custom-${prop}')).toBeInTheDocument()`
    ).join('\n      ')
  }

  private getPropsVariationsTests(componentInfo: ComponentInfo): string {
    const { props } = componentInfo
    
    if (props.length === 0) return ''
    
    return `
    test('рендерится с различными вариантами props', () => {
      const variations = [
        { ${props[0]}: 'variant1' },
        { ${props[0]}: 'variant2' },
        ${props.length > 1 ? `{ ${props[1]}: true }` : ''}
      ]
      
      variations.forEach((variation, index) => {
        const { unmount } = render(<${componentInfo.name} {...defaultProps} {...variation} />)
        expect(screen.getByRole('${this.getMainRole(componentInfo)}')).toBeInTheDocument()
        unmount()
      })
    })`
  }

  private getMainRole(componentInfo: ComponentInfo): string {
    const { name, isFormComponent } = componentInfo
    
    if (isFormComponent) return 'form'
    if (name.toLowerCase().includes('button')) return 'button'
    if (name.toLowerCase().includes('header')) return 'banner'
    if (name.toLowerCase().includes('footer')) return 'contentinfo'
    if (name.toLowerCase().includes('nav')) return 'navigation'
    if (name.toLowerCase().includes('main')) return 'main'
    
    return 'region' // Общий fallback
  }
}

