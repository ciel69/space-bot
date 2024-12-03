<script setup lang="ts">
  import { nextTick, onMounted, ref, useTemplateRef, watch } from 'vue'
  import { Application, Graphics, Ticker } from 'pixi.js'
  import { hapticFeedback } from '@telegram-apps/sdk'

  const field = useTemplateRef('field')
  const isRunning = ref(false)

  const ticker = Ticker.shared
  ticker.autoStart = false
  let gridSize = 10 // Размер сетки (10x10)
  let cellSize = 50 // Размер клетки в пикселях

  let app: Application | null = null

  const friendlyShips: Graphics[] = [] // Список дружественных кораблей
  const enemyShips: Graphics[] = [] // Список вражеских кораблей
  const lastFireTime: { [key: string]: number } = {} // Время последнего выстрела для каждого корабля
  const fireDelay = 1000 // Задержка между выстрелами в миллисекундах (например, 1 секунда)

  type Ship = Graphics & {
    isFriendly: boolean
  }

  let draggingShip: Ship | null = null
  let offsetX = 0
  let offsetY = 0

  const calculateGridAndCellSize = () => {
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight
    gridSize = 10
    cellSize = Math.min(screenWidth / gridSize, screenHeight / gridSize)
  }

  const drawGrid = () => {
    if (!app) return
    const grid = new Graphics()

    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        grid.rect(x * cellSize, y * cellSize, cellSize, cellSize)
        grid.fill(0x2d2d2d)
        grid.stroke({
          width: 2,
          color: 0xffffff,
          alpha: 0.4,
        })
      }
    }

    app.stage.addChild(grid)
  }

  const checkCollision = (projectile: Graphics, enemyShip: Graphics, shooter: Graphics): boolean => {
    if (enemyShip === shooter) {
      return false
    }

    const distanceX = (projectile.x - enemyShip.x)
    const distanceY = (projectile.y - enemyShip.y)
    const distance = Math.sqrt((distanceX * distanceX) + (distanceY * distanceY))

    return (distance < ((cellSize / 2) + 5))
  }

  const animateProjectile = (projectile: Graphics, direction: 'left' | 'right', shooter: Graphics) => {
    const speed = 5
    const deviationAngle = (Math.random() * 0.4) - 0.2

    const move = () => {
      if (!projectile || !app) return

      const deviationX = Math.sin(deviationAngle) * 0.5
      const deviationY = Math.cos(deviationAngle) * 0.15

      projectile.x += (direction === 'right' ? speed : -speed) + deviationX
      projectile.y += deviationY

      // eslint-disable-next-line no-restricted-syntax
      for (const enemyShip of [...enemyShips, ...friendlyShips]) {
        if (checkCollision(projectile, enemyShip, shooter)) {
          app.stage.removeChild(projectile)
          return
        }
      }

      if (projectile.x < 0 || projectile.x > app.canvas.width || projectile.y < 0 || projectile.y > app.canvas.height) {
        app.stage.removeChild(projectile)
        app.ticker.remove(move)
      }
    }

    app?.ticker.add(move)
  }

  const createShip = (color: number, x: number, y: number, isFriendly: boolean): Graphics => {
    const ship = new Graphics() as Ship
    ship.rect(-cellSize / 2, -cellSize / 2, cellSize, cellSize)
    ship.fill(color)
    ship.x = (x * cellSize) + (cellSize / 2)
    ship.y = (y * cellSize) + (cellSize / 2)
    ship.isFriendly = isFriendly
    if (app) app.stage.addChild(ship)

    // Сделаем корабль интерактивным
    ship.interactive = true
    const initCoord = [(x * cellSize) + (cellSize / 2), (y * cellSize) + (cellSize / 2)]

    // Добавляем события для перетаскивания
    ship.on('pointerdown', (event) => {
      if (!ship.isFriendly) return // Запрещаем перетаскивать вражеские корабли

      draggingShip = ship
      const pointer = event.data.getLocalPosition(ship.parent)
      offsetX = pointer.x - ship.x
      offsetY = pointer.y - ship.y
    })

    ship.on('pointermove', (event) => {
      if (draggingShip) {
        const pointer = event.data.getLocalPosition(ship.parent)
        draggingShip.x = pointer.x - offsetX
        draggingShip.y = pointer.y - offsetY
      }
    })

    ship.on('pointerup', () => {
      if (draggingShip) {
        // Ограничиваем область для дружественных кораблей
        const maxX = (gridSize / 2) * cellSize

        if (draggingShip.isFriendly && draggingShip.x < maxX) {
          // Привязка к ближайшей клетке с учётом размеров корабля
          draggingShip.x = (Math.floor(draggingShip.x / cellSize) * ((cellSize * 2) / 2)) + (cellSize / 2)
          draggingShip.y = (Math.floor(draggingShip.y / cellSize) * ((cellSize * 2) / 2)) + (cellSize / 2)
        } else {
          console.log('else', initCoord)
          draggingShip.x = initCoord[0]
          draggingShip.y = initCoord[1]
        }

        draggingShip = null
      }
    })

    return ship
  }

  const addFriendlyShip = (x: number, y: number) => {
    if (!app) return
    const ship = createShip(0x0077ff, x, y, true)
    friendlyShips.push(ship)
  }

  const addEnemyShip = (x: number, y: number) => {
    if (!app) return
    const ship = createShip(0xff0000, x, y, false)
    enemyShips.push(ship)
  }

  const fireProjectile = (ship: Graphics, direction: 'left' | 'right', color: number) => {
    if (!app) return
    const currentTime = Date.now()
    const lastTime = lastFireTime[`${ship.x},${ship.y}`] || 0
    if (currentTime - lastTime < fireDelay) {
      return
    }

    lastFireTime[`${ship.x},${ship.y}`] = currentTime

    const projectile = new Graphics()
    projectile.circle(0, 0, 5)
    projectile.fill(color)

    projectile.x = ship.x
    projectile.y = ship.y

    projectile.x += (direction === 'right' ? cellSize / 2 : -cellSize / 2)

    app.stage.addChild(projectile)

    animateProjectile(projectile, direction, ship)
  }

  const startShooting = () => {
    friendlyShips.forEach((ship) => {
      ticker.add(() => {
        fireProjectile(ship, 'right', 0x00ff00)
      })
    })

    enemyShips.forEach((ship) => {
      ticker.add(() => {
        fireProjectile(ship, 'left', 0xff0000)
      })
    })
  }

  // const destroyPixi = () => {
  //   if (app) {
  //     app.destroy(true, { children: true })
  //     app = null
  //   }
  // }

  const initializePixi = async () => {
    hapticFeedback.isSupported()
    if (!field.value) return
    await nextTick()

    calculateGridAndCellSize()

    app = new Application()

    await app.init({
      background: '#242424',
      resizeTo: field.value!,
    })

    field.value.appendChild(app.canvas)

    drawGrid()

    addFriendlyShip(2, 3)
    addFriendlyShip(4, 5)

    addEnemyShip(6, 3)
    addEnemyShip(8, 5)

    startShooting()
  }

  const changeNavigation = () => {
    hapticFeedback.impactOccurred('heavy')
    isRunning.value = !isRunning.value
  }

  onMounted(initializePixi)
  // onBeforeUnmount(destroyPixi)
  watch(isRunning, (val) => {
    if (val) {
      ticker.start()
    } else {
      ticker.stop()
    }
  })
</script>

<template>
  <div>
    <div ref="field" class="field-play" />
    <button type="button" @click="changeNavigation">{{ isRunning ? 'Pause' : 'Start' }}</button>
  </div>
</template>

<style scoped lang="scss">
.field-play {
  width: 100%;
  height: 100%;
}
</style>
