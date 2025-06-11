import fs from 'fs'
import path from 'path'

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

export class ComponentAnalyzer {
  async analyzeComponent(filePath: string): Promise<ComponentInfo> {
    const content = fs.readFileSync(filePath, 'utf-8')
    const fileName = path.basename(filePath, path.extname(filePath))
    
    return {
      name: this.extractComponentName(content, fileName),
      filePath,
      props: this.extractProps(content),
      hooks: this.extractHooks(content),
      methods: this.extractMethods(content),
      imports: this.extractImports(content),
      hasState: this.hasState(content),
      hasEffects: this.hasEffects(content),
      isFormComponent: this.isFormComponent(content),
      hasEventHandlers: this.hasEventHandlers(content),
      exportType: this.getExportType(content),
      dependencies: this.extractDependencies(content),
      complexity: this.calculateComplexity(content),
    }
  }

  private extractComponentName(content: string, fileName: string): string {
    // Ищем export default function ComponentName
    const defaultFunctionMatch = content.match(/export\s+default\s+function\s+(\w+)/);
    if (defaultFunctionMatch) {
      return defaultFunctionMatch[1];
    }

    // Ищем const ComponentName = () =>
    const arrowFunctionMatch = content.match(/(?:export\s+)?(?:default\s+)?const\s+(\w+)\s*=\s*\(/);
    if (arrowFunctionMatch) {
      return arrowFunctionMatch[1];
    }

    // Ищем function ComponentName
    const functionMatch = content.match(/function\s+(\w+)\s*\(/);
    if (functionMatch) {
      return functionMatch[1];
    }

    // Используем имя файла как fallback
    return fileName.charAt(0).toUpperCase() + fileName.slice(1);
  }

  private extractProps(content: string): string[] {
    const props: string[] = []
    
    // Ищем TypeScript интерфейсы для props
    const interfaceMatches = content.matchAll(/interface\s+\w*Props\w*\s*{([^}]+)}/g)
    for (const match of interfaceMatches) {
      const propsContent = match[1]
      const propMatches = propsContent.matchAll(/(\w+)[\?\:]?\s*:/g)
      for (const propMatch of propMatches) {
        props.push(propMatch[1])
      }
    }

    // Ищем type определения
    const typeMatches = content.matchAll(/type\s+\w*Props\w*\s*=\s*{([^}]+)}/g)
    for (const match of typeMatches) {
      const propsContent = match[1]
      const propMatches = propsContent.matchAll(/(\w+)[\?\:]?\s*:/g)
      for (const propMatch of propMatches) {
        props.push(propMatch[1])
      }
    }

    // Ищем деструктуризацию в параметрах функции
    const destructuringMatches = content.matchAll(/\(\s*{\s*([^}]+)\s*}[^)]*\)/g)
    for (const match of destructuringMatches) {
      const destructuredProps = match[1].split(',').map(prop => 
        prop.trim().split(':')[0].trim()
      )
      props.push(...destructuredProps)
    }

    return [...new Set(props)].filter(prop => prop && !prop.includes('...'))
  }

  private extractHooks(content: string): string[] {
    const hooks: string[] = []
    
    // Стандартные React хуки
    const reactHooks = [
      'useState', 'useEffect', 'useContext', 'useReducer', 'useCallback',
      'useMemo', 'useRef', 'useImperativeHandle', 'useLayoutEffect', 'useDebugValue'
    ]

    // Кастомные хуки (начинаются с use)
    const customHookMatches = content.matchAll(/use[A-Z]\w*/g)
    
    for (const hook of reactHooks) {
      if (content.includes(hook)) {
        hooks.push(hook)
      }
    }

    for (const match of customHookMatches) {
      hooks.push(match[0])
    }

    return [...new Set(hooks)]
  }

  private extractMethods(content: string): string[] {
    const methods: string[] = []
    
    // Ищем методы внутри компонента
    const methodMatches = content.matchAll(/const\s+(\w+)\s*=\s*(?:\([^)]*\)\s*=>|function)/g)
    for (const match of methodMatches) {
      methods.push(match[1])
    }

    // Ищем обработчики событий
    const handlerMatches = content.matchAll(/const\s+(handle\w+|on\w+)\s*=/g)
    for (const match of handlerMatches) {
      methods.push(match[1])
    }

    return [...new Set(methods)]
  }

  private extractImports(content: string): string[] {
    const imports: string[] = []
    
    const importMatches = content.matchAll(/import\s+(?:{[^}]+}|\w+|[^}]+)\s+from\s+['"]([^'"]+)['"]/g)
    for (const match of importMatches) {
      imports.push(match[1])
    }

    return imports
  }

  private hasState(content: string): boolean {
    return content.includes('useState') || 
           content.includes('useReducer') ||
           content.includes('this.state')
  }

  private hasEffects(content: string): boolean {
    return content.includes('useEffect') || 
           content.includes('useLayoutEffect') ||
           content.includes('componentDidMount') ||
           content.includes('componentDidUpdate')
  }

  private isFormComponent(content: string): boolean {
    const formIndicators = [
      '<form', 'onSubmit', 'input', 'textarea', 'select',
      'FormData', 'preventDefault', 'validation', 'useForm'
    ]
    
    return formIndicators.some(indicator => content.includes(indicator))
  }

  private hasEventHandlers(content: string): boolean {
    const eventHandlers = [
      'onClick', 'onChange', 'onSubmit', 'onFocus', 'onBlur',
      'onMouseEnter', 'onMouseLeave', 'onKeyDown', 'onKeyUp'
    ]
    
    return eventHandlers.some(handler => content.includes(handler))
  }

  private getExportType(content: string): 'default' | 'named' {
    return content.includes('export default') ? 'default' : 'named'
  }

  private extractDependencies(content: string): string[] {
    const dependencies: string[] = []
    
    // Внешние библиотеки
    const externalDeps = [
      'react', 'next', 'framer-motion', 'next-themes', '@emailjs/browser',
      'react-hot-toast', 'swiper'
    ]

    for (const dep of externalDeps) {
      if (content.includes(`from '${dep}'`) || content.includes(`from "${dep}"`)) {
        dependencies.push(dep)
      }
    }

    return dependencies
  }

  private calculateComplexity(content: string): 'low' | 'medium' | 'high' {
    let complexityScore = 0
    
    // Подсчет различных факторов сложности
    const lines = content.split('\n').length
    const hooks = this.extractHooks(content).length
    const methods = this.extractMethods(content).length
    const conditionals = (content.match(/if\s*\(|switch\s*\(|\?\s*:/g) || []).length
    const loops = (content.match(/for\s*\(|while\s*\(|\.map\(|\.forEach\(/g) || []).length
    
    complexityScore += Math.floor(lines / 50) // 1 балл за каждые 50 строк
    complexityScore += hooks * 2 // 2 балла за каждый хук
    complexityScore += methods // 1 балл за каждый метод
    complexityScore += conditionals * 2 // 2 балла за каждое условие
    complexityScore += loops * 3 // 3 балла за каждый цикл

    if (complexityScore <= 5) return 'low'
    if (complexityScore <= 15) return 'medium'
    return 'high'
  }

  // Анализ зависимостей между компонентами
  async analyzeComponentDependencies(componentsDir: string): Promise<Map<string, string[]>> {
    const dependencies = new Map<string, string[]>()
    const componentFiles = this.findAllComponents(componentsDir)
    
    for (const filePath of componentFiles) {
      const content = fs.readFileSync(filePath, 'utf-8')
      const componentName = path.basename(filePath, path.extname(filePath))
      const deps = this.extractLocalImports(content, componentsDir)
      dependencies.set(componentName, deps)
    }

    return dependencies
  }

  private findAllComponents(dir: string): string[] {
    const components: string[] = []
    
    const scanDirectory = (currentDir: string) => {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name)
        
        if (entry.isDirectory()) {
          scanDirectory(fullPath)
        } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx')) {
          components.push(fullPath)
        }
      }
    }

    scanDirectory(dir)
    return components
  }

  private extractLocalImports(content: string, componentsDir: string): string[] {
    const localImports: string[] = []
    
    const importMatches = content.matchAll(/import\s+[^'"]*from\s+['"]([^'"]+)['"]/g)
    for (const match of importMatches) {
      const importPath = match[1]
      
      // Проверяем, является ли это локальным импортом
      if (importPath.startsWith('./') || importPath.startsWith('../') || importPath.startsWith('@/')) {
        localImports.push(importPath)
      }
    }

    return localImports
  }

  // Генерация отчета об анализе
  async generateAnalysisReport(componentsDir: string): Promise<void> {
    console.log('📊 Генерация отчета анализа компонентов...')
    
    const componentFiles = this.findAllComponents(componentsDir)
    const analysisResults = []
    
    for (const filePath of componentFiles) {
      const componentInfo = await this.analyzeComponent(filePath)
      analysisResults.push(componentInfo)
    }

    const report = {
      totalComponents: analysisResults.length,
      complexityDistribution: this.getComplexityDistribution(analysisResults),
      mostCommonHooks: this.getMostCommonHooks(analysisResults),
      formComponents: analysisResults.filter(c => c.isFormComponent).length,
      componentsWithState: analysisResults.filter(c => c.hasState).length,
      componentsWithEffects: analysisResults.filter(c => c.hasEffects).length,
      averagePropsCount: this.getAveragePropsCount(analysisResults),
      components: analysisResults,
    }

    const reportPath = path.join(process.cwd(), 'component-analysis-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    console.log('📋 Отчет анализа компонентов:')
    console.log(`📊 Всего компонентов: ${report.totalComponents}`)
    console.log(`🔥 Сложность: Низкая: ${report.complexityDistribution.low}, Средняя: ${report.complexityDistribution.medium}, Высокая: ${report.complexityDistribution.high}`)
    console.log(`📝 Форм: ${report.formComponents}`)
    console.log(`🎯 С состоянием: ${report.componentsWithState}`)
    console.log(`⚡ С эффектами: ${report.componentsWithEffects}`)
    console.log(`📄 Полный отчет: ${reportPath}`)
  }

  private getComplexityDistribution(components: ComponentInfo[]) {
    return {
      low: components.filter(c => c.complexity === 'low').length,
      medium: components.filter(c => c.complexity === 'medium').length,
      high: components.filter(c => c.complexity === 'high').length,
    }
  }

  private getMostCommonHooks(components: ComponentInfo[]): Record<string, number> {
    const hookCounts: Record<string, number> = {}
    
    for (const component of components) {
      for (const hook of component.hooks) {
        hookCounts[hook] = (hookCounts[hook] || 0) + 1
      }
    }

    return Object.fromEntries(
      Object.entries(hookCounts).sort(([,a], [,b]) => b - a).slice(0, 10)
    )
  }

  private getAveragePropsCount(components: ComponentInfo[]): number {
    const totalProps = components.reduce((sum, c) => sum + c.props.length, 0)
    return Math.round((totalProps / components.length) * 100) / 100
  }
}

