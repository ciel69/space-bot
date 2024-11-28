<script setup lang="ts">
  import { onMounted, onUnmounted, useTemplateRef, nextTick } from 'vue'
  import { Application, Container, Graphics } from 'pixi.js'
  import { Navigation } from '@/shared/navigation'
  import { Layout } from '@/shared/layout'

  // Ссылка на контейнер для Pixi.js
  const canvasRef = useTemplateRef('canvasRef')

  let app: Application // Экземпляр приложения PixiJS
  let mapContainer: Container // Контейнер для карты
  let dragging = false // Флаг перетаскивания
  let dragStart = { x: 0, y: 0 } // Точка начала перетаскивания
  let mapStart = { x: 0, y: 0 } // Начальная позиция карты
  let scale = 1 // Масштаб карты

  // Начало перетаскивания
  const onDragStart = (event: MouseEvent) => {
    dragging = true
    dragStart = { x: event.clientX, y: event.clientY }
    mapStart = { x: mapContainer.x, y: mapContainer.y }
  }

  // Перемещение карты
  const onDragMove = (event: MouseEvent) => {
    if (!dragging) return

    const dx = event.clientX - dragStart.x
    const dy = event.clientY - dragStart.y

    mapContainer.x = mapStart.x + dx
    mapContainer.y = mapStart.y + dy
  }

  // Завершение перетаскивания
  const onDragEnd = () => {
    dragging = false
  }

  // Масштабирование карты
  const onZoom = (event: WheelEvent) => {
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1
    scale *= zoomFactor

    // Ограничение масштаба
    scale = Math.max(0.5, Math.min(3, scale))

    mapContainer.scale.set(scale)
  }

  // Создание звёздного фона
  const createStars = (count: number) => {
    for (let i = 0; i < count; i++) {
      const star = new Graphics()
      star.circle(0, 0, (Math.random() * 2) + 1) // Рандомный размер
      star.fill(0xffffff) // Белые звёзды

      star.x = (Math.random() * 2000) - 1000 // Рандомное положение
      star.y = (Math.random() * 2000) - 1000

      mapContainer.addChild(star)
    }
  }

  // Инициализация приложения PixiJS
  const initPixiApp = async () => {
    await nextTick()
    app = new Application()
    await app.init({
      width: 800, // Ширина приложения
      height: 600, // Высота приложения
      backgroundColor: 0x000000, // Цвет фона (чёрный)
      antialias: true, // Сглаживание
    })

    // Добавление канваса в DOM
    if (canvasRef.value) {
      canvasRef.value.appendChild(app.canvas)
    }

    // Создаём контейнер для карты
    mapContainer = new Container()
    app.stage.addChild(mapContainer)

    // Создаём звёздный фон
    createStars(500)

    // Устанавливаем обработчики для перемещения карты
    app.canvas.addEventListener('pointerdown', onDragStart)
    app.canvas.addEventListener('pointermove', onDragMove)
    app.canvas.addEventListener('pointerup', onDragEnd)
    app.canvas.addEventListener('pointerleave', onDragEnd)
    app.canvas.addEventListener('wheel', onZoom, { passive: false })
  }

  // Уничтожение Pixi.js при удалении компонента
  // const destroyPixiApp = () => {
  //   app.destroy(true, { children: true })
  //   app.canvas.removeEventListener('pointerdown', onDragStart)
  //   app.canvas.removeEventListener('pointermove', onDragMove)
  //   app.canvas.removeEventListener('pointerup', onDragEnd)
  //   app.canvas.removeEventListener('pointerleave', onDragEnd)
  //   app.canvas.removeEventListener('wheel', onZoom)
  // }

  onMounted(() => {
    initPixiApp()
  })

  onUnmounted(() => {
    // destroyPixiApp()
  })
</script>

<template>
  <Layout>
    <div ref="canvasRef" style="width: 100%; height: 100%;" />
    <template #navigation>
      <Navigation />
    </template>
  </Layout>
</template>

<style scoped>
div {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
