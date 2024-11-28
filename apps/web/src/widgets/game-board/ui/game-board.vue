<script setup lang="ts">
  import { nextTick, onBeforeUnmount, onMounted, useTemplateRef } from 'vue'
  import { Application, Graphics } from 'pixi.js'

  const field = useTemplateRef('field')
  let gridSize = 10 // Размер сетки (10x10)
  let cellSize = 50 // Размер клетки в пикселях

  let app: Application | null = null

  const friendlyShips: Graphics[] = [] // Список дружественных кораблей
  const enemyShips: Graphics[] = [] // Список вражеских кораблей
  const lastFireTime: { [key: string]: number } = {} // Время последнего выстрела для каждого корабля
  const fireDelay = 1000 // Задержка между выстрелами в миллисекундах (например, 1 секунда)

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
        grid.rect(x * cellSize, y * cellSize, cellSize, cellSize)
        grid.fill(0x2d2d2d) // Тёмно-серый фон ячейки
        grid.stroke({
          width: 2,
          color: 0xffffff,
          alpha: 0.4,
        }) // Белые линии для границ
      }
    }

    app.stage.addChild(grid)
  }

  /**
   * Проверка на попадание снаряда в корабль
   * @param projectile Снаряд
   * @param enemyShip Вражеский корабль
   * @param shooter Корабль, из которого был выстрелен снаряд
   */
  const checkCollision = (projectile: Graphics, enemyShip: Graphics, shooter: Graphics): boolean => {
    // Проверяем, не столкнулся ли снаряд с кораблем, из которого он был выстрелен
    if (enemyShip === shooter) {
      return false
    }

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
   * @param shooter Корабль, из которого был выстрелен снаряд
   */
  const animateProjectile = (projectile: Graphics, direction: 'left' | 'right', shooter: Graphics) => {
    const speed = 5
    const deviationAngle = (Math.random() * 0.4) - 0.2 // Отклонение траектории

    const move = () => {
      if (!projectile || !app) return

      // Движение снаряда
      const deviationX = Math.sin(deviationAngle) * 0.5
      const deviationY = Math.cos(deviationAngle) * 0.15

      projectile.x += (direction === 'right' ? speed : -speed) + deviationX
      projectile.y += deviationY

      // Проверка на попадание
      // eslint-disable-next-line no-restricted-syntax
      for (const enemyShip of [...enemyShips, ...friendlyShips]) {
        if (checkCollision(projectile, enemyShip, shooter)) {
          app.stage.removeChild(projectile) // Удаляем снаряд
          return // Завершаем обработку снаряда
        }
      }

      // Удаление снаряда за пределами поля
      if (projectile.x < 0 || projectile.x > app.canvas.width || projectile.y < 0 || projectile.y > app.canvas.height) {
        app.stage.removeChild(projectile)
        app.ticker.remove(move) // Удаляем обработчик движения
      }
    }

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
    ship.rect(-cellSize / 2, -cellSize / 2, cellSize, cellSize) // Центрируем прямоугольник
    ship.fill(color)
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
   * @param color Цвет снаряда
   */
  const fireProjectile = (ship: Graphics, direction: 'left' | 'right', color: number) => {
    if (!app) return

    const currentTime = Date.now()

    // Проверка, прошла ли задержка между выстрелами
    const lastTime = lastFireTime[`${ship.x},${ship.y}`] || 0
    if (currentTime - lastTime < fireDelay) {
      return // Если задержка не прошла, выстрел не делаем
    }
    console.log('fireProjectile', direction)

    // Обновляем время последнего выстрела
    lastFireTime[`${ship.x},${ship.y}`] = currentTime

    const projectile = new Graphics()
    projectile.circle(0, 0, 5)
    projectile.fill(color)

    projectile.x = ship.x
    projectile.y = ship.y

    // Смещение по оси X в зависимости от направления
    projectile.x += (direction === 'right' ? cellSize / 2 : -cellSize / 2)

    app.stage.addChild(projectile)

    animateProjectile(projectile, direction, ship) // Передаем корабль, из которого был выстрелен снаряд
  }

  /**
   * Старт стрельбы между дружественными и вражескими кораблями
   */
  const startShooting = () => {
    friendlyShips.forEach((ship) => {
      app?.ticker.add(() => {
        fireProjectile(ship, 'right', 0x00ff00) // Дружественные корабли
      })
    })

    enemyShips.forEach((ship) => {
      app?.ticker.add(() => {
        fireProjectile(ship, 'left', 0xff0000) // Вражеские корабли
      })
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
