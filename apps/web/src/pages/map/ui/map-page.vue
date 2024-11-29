<script setup lang="ts">
  import { onMounted, useTemplateRef, nextTick } from 'vue'
  import { Application, Assets, Container, Sprite } from 'pixi.js'
  import spaceWebSrc from '@/assets/space.webp'
  import { Navigation } from '@/shared/navigation'
  import { Layout } from '@/shared/layout'

  const canvasRef = useTemplateRef('canvasRef')

  let app: Application
  let mapContainer: Container
  let dragging = false
  let dragStart = { x: 0, y: 0 }
  let mapStart = { x: 0, y: 0 }
  let scale = 1

  // Видимая область
  const viewSize = { width: 800, height: 600 }

  const onDragStart = (event: MouseEvent) => {
    dragging = true
    dragStart = { x: event.clientX, y: event.clientY }
    mapStart = { x: mapContainer.x, y: mapContainer.y }
  }

  const onDragMove = (event: MouseEvent) => {
    if (!dragging) return

    const dx = event.clientX - dragStart.x
    const dy = event.clientY - dragStart.y

    // Предварительно рассчитываем новые координаты
    let newX = mapStart.x + dx
    let newY = mapStart.y + dy

    // Расчёт границ с учётом масштаба карты
    const scaledWidth = mapContainer.width * scale // Ширина карты с учётом масштаба
    const scaledHeight = mapContainer.height * scale // Высота карты с учётом масштаба

    const minX = Math.min(0, viewSize.width - scaledWidth) // Левая граница
    const maxX = 0 // Правая граница (если не увеличивать карту, край всегда 0)

    const minY = Math.min(0, viewSize.height - scaledHeight) // Верхняя граница
    const maxY = 0 // Нижняя граница

    // Ограничиваем координаты карты в рамках границ
    newX = Math.max(minX, Math.min(maxX, newX))
    newY = Math.max(minY, Math.min(maxY, newY))

    // Устанавливаем ограниченные значения
    mapContainer.x = newX
    mapContainer.y = newY
  }

  const onDragEnd = () => {
    dragging = false
  }

  const onZoom = (event: WheelEvent) => {
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1
    scale *= zoomFactor

    // Ограничение масштаба
    scale = Math.max(0.5, Math.min(3, scale))
    mapContainer.scale.set(scale)

    // После масштабирования ограничиваем координаты карты
    const scaledWidth = mapContainer.width * scale
    const scaledHeight = mapContainer.height * scale

    const minX = Math.min(0, viewSize.width - scaledWidth)
    const maxX = 0

    const minY = Math.min(0, viewSize.height - scaledHeight)
    const maxY = 0

    mapContainer.x = Math.max(minX, Math.min(maxX, mapContainer.x))
    mapContainer.y = Math.max(minY, Math.min(maxY, mapContainer.y))
  }

  // const createStars = (count: number) => {
  //   for (let i = 0; i < count; i++) {
  //     const star = new Graphics()
  //     star.circle(0, 0, (Math.random() * 2) + 1)
  //     star.fill(0xffffff)
  //     star.x = (Math.random() * 4000) - 1000
  //     star.y = (Math.random() * 4000) - 1000
  //     mapContainer.addChild(star)
  //   }
  // }

  const initPixiApp = async () => {
    await nextTick()
    app = new Application()
    await app.init({
      width: 800,
      height: 600,
      backgroundColor: 0x000000,
      antialias: true,
    })

    if (canvasRef.value) {
      canvasRef.value.appendChild(app.canvas)
    }

    mapContainer = new Container()
    app.stage.addChild(mapContainer)

    await Assets.load({
      alias: 'spiceOne',
      src: spaceWebSrc,
    })
    const background = Sprite.from('spiceOne')
    background.alpha = 0.5
    mapContainer.addChild(background)

    // createStars(100)

    app.canvas.addEventListener('pointerdown', onDragStart)
    app.canvas.addEventListener('pointermove', onDragMove)
    app.canvas.addEventListener('pointerup', onDragEnd)
    app.canvas.addEventListener('pointerleave', onDragEnd)
    app.canvas.addEventListener('wheel', onZoom, { passive: false })
  }

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

  // onUnmounted(() => {
  //   destroyPixiApp()
  // })
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
