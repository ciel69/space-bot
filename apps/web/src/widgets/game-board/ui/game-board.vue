<script setup lang="ts">
  import { nextTick, onBeforeUnmount, onMounted, useTemplateRef } from 'vue'
  import { Application, Graphics } from 'pixi.js'

  const field = useTemplateRef('field')
  let gridSize = 10 // Размер сетки (10x10)
  let cellSize = 50 // Размер клетки в пикселях

  let app: Application | null = null

  const friendlyShips: Graphics[] = [] // Список дружественных кораблей
  const enemyShips: Graphics[] = [] // Список вражеских кораблей

  /**
   * Рассчитать размеры сетки и клеток в зависимости от экрана
   */
  const calculateGridAndCellSize = () => {
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight

    // Устанавливаем сетку 10x10, чтобы сохранить пропорции
    gridSize = 10

    // Выбираем минимальный размер клетки, чтобы поле помещалось на экран
    cellSize = Math.min(screenWidth / gridSize, screenHeight / gridSize)
  }

  /**
   * Отрисовка сетки поля боя
   */
  const drawGrid = () => {
    if (!app) return

    const grid = new Graphics()

    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        // Рисуем каждую ячейку с отдельным стилем
        grid.lineStyle(2, 0xffffff, 1) // Белые линии для границ
        grid.beginFill(0x2d2d2d) // Тёмно-серый фон ячейки
        grid.drawRect(x * cellSize, y * cellSize, cellSize, cellSize)
        grid.endFill() // Завершаем заполнение текущей ячейки
      }
    }

    app.stage.addChild(grid)
  }

  /**
   * Проверка на попадание снаряда в корабль
   */
  const checkCollision = (projectile: Graphics, enemyShip: Graphics): boolean => {
    // Для простоты: проверяем пересечение с прямоугольником, занимаемым кораблём
    const distanceX = (projectile.x - enemyShip.x)
    const distanceY = (projectile.y - enemyShip.y)
    const distance = Math.sqrt((distanceX * distanceX) + (distanceY * distanceY))

    return (distance < ((cellSize / 2) + 5)) // Если расстояние меньше, чем радиус снаряда + половина размера ячейки
  }

  /**
   * Анимация движения снаряда
   * @param projectile Снаряд
   * @param direction Направление движения ('left' или 'right')
   */
  const animateProjectile = (projectile: Graphics, direction: 'left' | 'right') => {
    const speed = 5
    const deviationAngle = (Math.random() * 0.4) - 0.2 // Отклонение траектории от -0.2 до 0.2 (меньше)

    const move = () => {
      if (!projectile || !app) return

      // Движение с меньшим отклонением
      const deviationX = Math.sin(deviationAngle) * 0.5 // Меньшее отклонение по оси X
      const deviationY = Math.cos(deviationAngle) * 0.15 // Меньшее отклонение по оси Y

      projectile.x += ((direction === 'right') ? speed : -speed) + deviationX
      projectile.y += deviationY

      // Проверка на попадание в вражеский корабль
      // eslint-disable-next-line no-restricted-syntax
      for (const enemyShip of enemyShips) {
        if (checkCollision(projectile, enemyShip)) {
          app.stage.removeChild(projectile) // Удаляем снаряд при попадании
          break
        }
      }
      // eslint-disable-next-line no-restricted-syntax
      for (const friendlyShip of friendlyShips) {
        if (checkCollision(projectile, friendlyShip)) {
          app.stage.removeChild(projectile) // Удаляем снаряд при попадании
          break
        }
      }

      // Удаление снаряда, если он вышел за пределы поля
      if ((projectile.x < 0) || (projectile.x > app.view.width) || (projectile.y < 0) || (projectile.y > app.view.height)) {
        app.stage.removeChild(projectile)
        app.ticker.remove(move) // Обязательно удаляем обработчик движения снаряда
      }
    }

    // Убедитесь, что каждый новый снаряд имеет свою анимацию
    app?.ticker.add(move)
  }

  /**
   * Создание корабля
   * @param color Цвет корабля
   * @param x Координата X
   * @param y Координата Y
   */
  const createShip = (color: number, x: number, y: number): Graphics => {
    const ship = new Graphics()
    ship.beginFill(color)
    ship.drawRect(-cellSize / 2, -cellSize / 2, cellSize, cellSize) // Центрируем прямоугольник
    ship.endFill()
    ship.x = (x * cellSize) + (cellSize / 2) // Центрируем по X
    ship.y = (y * cellSize) + (cellSize / 2) // Центрируем по Y
    if (app) app.stage.addChild(ship)
    return ship
  }

  /**
   * Добавление дружественного корабля на поле боя
   * @param x Координата X
   * @param y Координата Y
   */
  const addFriendlyShip = (x: number, y: number) => {
    if (!app) return

    const ship = createShip(0x0077ff, x, y)
    friendlyShips.push(ship)
  }

  /**
   * Добавление вражеского корабля на поле боя
   * @param x Координата X
   * @param y Координата Y
   */
  const addEnemyShip = (x: number, y: number) => {
    if (!app) return

    const ship = createShip(0xff0000, x, y)
    enemyShips.push(ship)
  }

  /**
   * Стрельба снарядом
   * @param ship Корабль, который стреляет
   * @param direction Направление выстрела ('left' или 'right')
   */
  const fireProjectile = (ship: Graphics, direction: 'left' | 'right', color: number) => {
    if (!app) return

    const projectile = new Graphics()
    projectile.beginFill(color)
    projectile.drawCircle(0, 0, 5) // Радиус снаряда — 5
    projectile.endFill()

    // Снаряд стартует из центра корабля
    projectile.x = ship.x
    projectile.y = ship.y

    // Смещение по оси X в зависимости от направления
    projectile.x += (direction === 'right' ? cellSize / 2 : -cellSize / 2)

    app.stage.addChild(projectile)

    animateProjectile(projectile, direction) // Запускаем анимацию
  }

  /**
   * Старт стрельбы между дружественными и вражескими кораблями
   */
  const startShooting = () => {
    friendlyShips.forEach((ship) => {
      setInterval(() => fireProjectile(ship, 'right', 0x00ff00), 1000) // Зелёные снаряды
    })

    enemyShips.forEach((ship) => {
      setInterval(() => fireProjectile(ship, 'left', 0xff0000), 1000) // Красные снаряды
    })
  }

  /**
   * Уничтожение PixiJS приложения перед размонтированием компонента
   */
  const destroyPixi = () => {
    if (app) {
      app.destroy(true, { children: true })
      app = null
    }
  }

  /**
   * Инициализация PixiJS приложения
   */
  const initializePixi = async () => {
    if (!field.value) return
    await nextTick()

    calculateGridAndCellSize()

    app = new Application()

    await app.init({
      background: '#242424',
      resizeTo: field.value!,
    })

    // Добавляем canvas PixiJS в DOM
    field.value.appendChild(app.canvas)

    // Отрисовываем сетку поля боя
    drawGrid()

    // Добавляем дружественные корабли
    addFriendlyShip(2, 3)
    addFriendlyShip(4, 5)

    // Добавляем вражеские корабли
    addEnemyShip(6, 3)
    addEnemyShip(8, 5)

    // Запускаем стрельбу
    startShooting()
  }

  onMounted(initializePixi)
  onBeforeUnmount(destroyPixi)

</script>

<template>
  <div ref="field" class="field-play" />
</template>

<style scoped lang="scss">
.field-play {
  width: 100%;
  height: 100%;
}
</style>
