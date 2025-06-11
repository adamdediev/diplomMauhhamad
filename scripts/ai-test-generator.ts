import fs from 'fs'
import path from 'path'
import { ComponentAnalyzer } from './component-analyzer'
import { TestTemplates } from './test-templates'

interface AITestGeneratorConfig {
  openaiApiKey?: string
  componentsDir: string
  testsDir: string
  excludePatterns?: string[]
}

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
}

export class AITestGenerator {
  private config: AITestGeneratorConfig
  private analyzer: ComponentAnalyzer
  private templates: TestTemplates

  constructor(config: AITestGeneratorConfig) {
    this.config = config
    this.analyzer = new ComponentAnalyzer()
    this.templates = new TestTemplates()
  }

  async generateTestsForAllComponents(): Promise<void> {
    console.log('🤖 Запуск AI-генератора тестов...')
    
    const componentFiles = this.findComponentFiles()
    console.log(`📁 Найдено ${componentFiles.length} компонентов для анализа`)

    for (const filePath of componentFiles) {
      try {
        await this.generateTestForComponent(filePath)
      } catch (error) {
        console.error(`❌ Ошибка при генерации теста для ${filePath}:`, error)
      }
    }

    console.log('✅ Генерация тестов завершена!')
  }

  private findComponentFiles(): string[] {
    const files: string[] = []
    
    const scanDirectory = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        
        if (entry.isDirectory()) {
          scanDirectory(fullPath)
        } else if (this.isComponentFile(entry.name)) {
          files.push(fullPath)
        }
      }
    }

    scanDirectory(this.config.componentsDir)
    return files
  }

  private isComponentFile(filename: string): boolean {
    const componentExtensions = ['.tsx', '.jsx']
    const excludePatterns = this.config.excludePatterns || ['test', 'spec', 'stories']
    
    const hasValidExtension = componentExtensions.some(ext => filename.endsWith(ext))
    const isNotExcluded = !excludePatterns.some(pattern => 
      filename.toLowerCase().includes(pattern.toLowerCase())
    )
    
    return hasValidExtension && isNotExcluded
  }

  private async generateTestForComponent(filePath: string): Promise<void> {
    console.log(`🔍 Анализ компонента: ${filePath}`)
    
    const componentInfo = await this.analyzer.analyzeComponent(filePath)
    const testContent = await this.generateTestContent(componentInfo)
    
    const testFilePath = this.getTestFilePath(filePath)
    this.ensureDirectoryExists(path.dirname(testFilePath))
    
    fs.writeFileSync(testFilePath, testContent, 'utf-8')
    console.log(`✅ Тест создан: ${testFilePath}`)
  }

  private async generateTestContent(componentInfo: ComponentInfo): Promise<string> {
    // Если есть OpenAI API ключ, используем AI для генерации
    if (this.config.openaiApiKey) {
      return await this.generateWithAI(componentInfo)
    }
    
    // Иначе используем шаблоны
    return this.templates.generateTestFromTemplate(componentInfo)
  }

  private async generateWithAI(componentInfo: ComponentInfo): Promise<string> {
    const prompt = this.createAIPrompt(componentInfo)
    
    try {
      // Здесь будет интеграция с OpenAI API
      // Пока используем заглушку
      console.log('🧠 Генерация с помощью AI...')
      
      // Симуляция AI-генерации
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return this.templates.generateAdvancedTest(componentInfo)
    } catch (error) {
      console.warn('⚠️ AI-генерация недоступна, используем шаблоны')
      return this.templates.generateTestFromTemplate(componentInfo)
    }
  }

  private createAIPrompt(componentInfo: ComponentInfo): string {
    return `
Создай comprehensive unit тест для React компонента на TypeScript.

Информация о компоненте:
- Название: ${componentInfo.name}
- Props: ${componentInfo.props.join(', ')}
- Hooks: ${componentInfo.hooks.join(', ')}
- Методы: ${componentInfo.methods.join(', ')}
- Имеет состояние: ${componentInfo.hasState}
- Имеет эффекты: ${componentInfo.hasEffects}
- Форма: ${componentInfo.isFormComponent}
- Обработчики событий: ${componentInfo.hasEventHandlers}

Требования к тесту:
1. Используй React Testing Library
2. Покрой все основные сценарии использования
3. Протестируй рендеринг с разными props
4. Протестируй пользовательские взаимодействия
5. Протестируй обработку ошибок
6. Используй TypeScript типизацию
7. Добавь описательные названия тестов
8. Включи тесты доступности (a11y)

Создай полный тест файл с импортами и всеми необходимыми тестами.
`
  }

  private getTestFilePath(componentPath: string): string {
    const relativePath = path.relative(this.config.componentsDir, componentPath)
    const testFileName = path.basename(relativePath, path.extname(relativePath)) + '.test.tsx'
    const testDir = path.join(this.config.testsDir, 'components', path.dirname(relativePath))
    
    return path.join(testDir, testFileName)
  }

  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
  }

  // Метод для обновления существующих тестов
  async updateExistingTests(): Promise<void> {
    console.log('🔄 Обновление существующих тестов...')
    
    const testFiles = this.findExistingTestFiles()
    
    for (const testFile of testFiles) {
      const componentPath = this.getComponentPathFromTest(testFile)
      if (fs.existsSync(componentPath)) {
        const componentInfo = await this.analyzer.analyzeComponent(componentPath)
        const updatedTest = await this.generateTestContent(componentInfo)
        
        // Сохраняем существующие кастомные тесты
        const existingContent = fs.readFileSync(testFile, 'utf-8')
        const mergedContent = this.mergeTestContent(existingContent, updatedTest)
        
        fs.writeFileSync(testFile, mergedContent, 'utf-8')
        console.log(`🔄 Обновлен тест: ${testFile}`)
      }
    }
  }

  private findExistingTestFiles(): string[] {
    const testFiles: string[] = []
    
    const scanTestDirectory = (dir: string) => {
      if (!fs.existsSync(dir)) return
      
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        
        if (entry.isDirectory()) {
          scanTestDirectory(fullPath)
        } else if (entry.name.endsWith('.test.tsx') || entry.name.endsWith('.test.ts')) {
          testFiles.push(fullPath)
        }
      }
    }

    scanTestDirectory(this.config.testsDir)
    return testFiles
  }

  private getComponentPathFromTest(testPath: string): string {
    const relativePath = path.relative(path.join(this.config.testsDir, 'components'), testPath)
    const componentFileName = path.basename(relativePath, '.test.tsx') + '.tsx'
    const componentDir = path.join(this.config.componentsDir, path.dirname(relativePath))
    
    return path.join(componentDir, componentFileName)
  }

  private mergeTestContent(existing: string, generated: string): string {
    // Простая логика слияния - можно улучшить
    const existingLines = existing.split('\n')
    const customTestsStart = existingLines.findIndex(line => 
      line.includes('// CUSTOM TESTS') || line.includes('// Кастомные тесты')
    )
    
    if (customTestsStart !== -1) {
      const customTests = existingLines.slice(customTestsStart).join('\n')
      return generated + '\n\n' + customTests
    }
    
    return generated
  }

  // Анализ качества тестов
  async analyzeTestQuality(): Promise<void> {
    console.log('📊 Анализ качества тестов...')
    
    const testFiles = this.findExistingTestFiles()
    const qualityReport = {
      totalTests: testFiles.length,
      coverageIssues: [] as string[],
      qualityIssues: [] as string[],
      recommendations: [] as string[],
    }

    for (const testFile of testFiles) {
      const content = fs.readFileSync(testFile, 'utf-8')
      const issues = this.analyzeTestFile(content, testFile)
      
      qualityReport.coverageIssues.push(...issues.coverage)
      qualityReport.qualityIssues.push(...issues.quality)
      qualityReport.recommendations.push(...issues.recommendations)
    }

    this.generateQualityReport(qualityReport)
  }

  private analyzeTestFile(content: string, filePath: string) {
    const issues = {
      coverage: [] as string[],
      quality: [] as string[],
      recommendations: [] as string[],
    }

    // Анализ покрытия
    if (!content.includes('render(')) {
      issues.coverage.push(`${filePath}: Отсутствует тест рендеринга`)
    }

    if (!content.includes('fireEvent') && !content.includes('userEvent')) {
      issues.coverage.push(`${filePath}: Отсутствуют тесты взаимодействия`)
    }

    // Анализ качества
    if (content.split('test(').length < 3) {
      issues.quality.push(`${filePath}: Мало тестовых случаев (< 3)`)
    }

    if (!content.includes('expect(')) {
      issues.quality.push(`${filePath}: Отсутствуют assertions`)
    }

    // Рекомендации
    if (!content.includes('describe(')) {
      issues.recommendations.push(`${filePath}: Рекомендуется группировать тесты в describe блоки`)
    }

    if (!content.includes('beforeEach') && !content.includes('afterEach')) {
      issues.recommendations.push(`${filePath}: Рассмотрите использование setup/cleanup хуков`)
    }

    return issues
  }

  private generateQualityReport(report: any): void {
    const reportPath = path.join(process.cwd(), 'test-quality-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    console.log('📋 Отчет о качестве тестов:')
    console.log(`📊 Всего тестов: ${report.totalTests}`)
    console.log(`⚠️ Проблемы покрытия: ${report.coverageIssues.length}`)
    console.log(`🔍 Проблемы качества: ${report.qualityIssues.length}`)
    console.log(`💡 Рекомендации: ${report.recommendations.length}`)
    console.log(`📄 Полный отчет сохранен: ${reportPath}`)
  }
}

// CLI интерфейс
if (require.main === module) {
  const config: AITestGeneratorConfig = {
    openaiApiKey: process.env.OPENAI_API_KEY,
    componentsDir: path.join(process.cwd(), 'components'),
    testsDir: path.join(process.cwd(), '__tests__'),
    excludePatterns: ['test', 'spec', 'stories', 'mock'],
  }

  const generator = new AITestGenerator(config)

  const command = process.argv[2]
  
  switch (command) {
    case 'generate':
      generator.generateTestsForAllComponents()
      break
    case 'update':
      generator.updateExistingTests()
      break
    case 'analyze':
      generator.analyzeTestQuality()
      break
    default:
      console.log('Использование:')
      console.log('  npm run test:generate - Генерация тестов для всех компонентов')
      console.log('  npm run test:update - Обновление существующих тестов')
      console.log('  npm run test:analyze - Анализ качества тестов')
  }
}

