<script setup lang="ts">
  import { computed, nextTick, onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
  import { Application, Graphics, Text, TextStyle } from 'pixi.js'

  const canvasRef = useTemplateRef('canvasRef')

  let app: Application | null = null

  interface Card {
    type: 'player' | 'enemy';
    hp: number;
    shield: number;
    damage: number;
    name: string;
  }

  const activePlayerCardIndex = ref(0)
  const activeEnemyCardIndex = ref(0)
  const playerHealth = ref(1000)
  const enemyHealth = ref(1000)

  const playerDeck = ref<Card[]>([
    { type: 'player', hp: 120, shield: 30, damage: 35, name: 'ship 1' },
    { type: 'player', hp: 150, shield: 30, damage: 30, name: 'ship 2' },
  ])
  const enemyDeck = ref<Card[]>([
    { type: 'enemy', hp: 110, shield: 25, damage: 30, name: 'ship 1' },
    { type: 'enemy', hp: 130, shield: 40, damage: 40, name: 'ship 2' },
  ])
  const playerDeckGp: Graphics[] = []
  const enemyDeckGp: Graphics[] = []

  const playerHP = computed(() => playerDeck.value.reduce((total, card) => total + card.hp, 0))
  const enemyHP = computed(() => enemyDeck.value.reduce((total, card) => total + card.hp, 0))

  const isBattleActive = ref(false)
  const animationDuration = 500 // ms

  const drawCard = (card: Card, x: number, y: number): Graphics => {
    // console.log('drawCard', card)
    const graphics = new Graphics()

    const color = card.type === 'enemy' ? 0xff0000 : 0x00ff00

    graphics.rect(-50, -75, 100, 150).fill(color)
    graphics.x = x
    graphics.y = y
    graphics.interactive = true

    const textStyle = new TextStyle({
      fontFamily: 'Arial',
      fontSize: 14,
      fill: 'white',
    })

    const hpText = new Text({
      text: `HP: ${card.hp}`,
      style: textStyle,
    })
    hpText.anchor.set(0.5, 0)
    hpText.x = 0
    hpText.y = -70
    graphics.addChild(hpText)

    const shieldText = new Text({
      text: `Shield: ${card.shield}`,
      style: textStyle,
    })
    shieldText.anchor.set(0.5, 0)
    shieldText.x = 0
    shieldText.y = -50
    graphics.addChild(shieldText)

    const damageText = new Text({
      text: `DMG: ${card.damage}`,
      style: textStyle,
    })
    damageText.anchor.set(0.5, 1)
    damageText.x = 0
    damageText.y = 70
    graphics.addChild(damageText)

    const nameText = new Text({
      text: card.name,
      style: textStyle,
    })
    nameText.anchor.set(0.5, 1)
    nameText.x = 0
    nameText.y = 0
    graphics.addChild(nameText)
    app?.stage.addChild(graphics)

    return graphics
  }

  const renderScene = () => {
    if (!app) return

    app.stage.removeChildren()

    // // Draw player health bar
    // const playerHealthBar = new Graphics()
    // playerHealthBar.beginFill(0x00ff00).drawRect(10, 600, playerHealth.value / 10, 10).endFill()
    // app.stage.addChild(playerHealthBar)
    //
    // // Draw enemy health bar
    // const enemyHealthBar = new Graphics()
    // enemyHealthBar.beginFill(0xff0000).drawRect(10, 10, enemyHealth.value / 10, 10).endFill()
    // app.stage.addChild(enemyHealthBar)

    // Draw player deck
    playerDeck.value.forEach((card, index) => {
      const cardGraphics = drawCard(card, 50 + (index * 80), 570)
      playerDeckGp.push(cardGraphics)
    })

    // Draw enemy deck
    enemyDeck.value.forEach((card, index) => {
      const cardGraphics = drawCard(card, 50 + (index * 80), 70)
      enemyDeckGp.push(cardGraphics)
    })

    // Draw active cards
    // if (isBattleActive.value) {
    //   const playerCard = drawCard(playerDeck.value[activePlayerCardIndex.value], 180, 400)
    //   const enemyCard = drawCard(enemyDeck.value[activeEnemyCardIndex.value], 180, 240)
    //   app.stage.addChild(playerCard)
    //   app.stage.addChild(enemyCard)
    // }
  }

  // eslint-disable-next-line @stylistic/js/max-len
  const animateCardMovement = (card: Graphics, targetX: number, targetY: number, isPlayerCard = true) => {
    console.log('animateCardMovement', card)
    const speed = 3
    const initialX = isPlayerCard
      ? 50 + (activePlayerCardIndex.value * 60)
      : 50 + (activeEnemyCardIndex.value * 60)
    const initialY = isPlayerCard ? 550 : 50
    // const targetWidth = 120
    // const targetHeight = 180
    // const initialWidth = 100
    // const initialHeight = 150

    // Начальные параметры для анимации
    let currentX = initialX
    let currentY = initialY
    // let width = initialWidth
    // let height = initialHeight

    // Создаем анимацию
    const move = () => {
      console.log('move')
      // Обновляем позицию карты
      if (currentX < targetX) currentX += speed
      if (currentY < targetY) currentY += speed

      // Вычисляем размер карты по ходу анимации
      // width = initialWidth + (((targetWidth - initialWidth) * (currentX - initialX)) / (targetX - initialX))
      // height = initialHeight + (((targetHeight - initialHeight) * (currentY - initialY)) / (targetY - initialY))
      console.log('currentX', currentX)
      console.log('currentY', currentY)
      // const dt = time.deltaTime * 0.01
      // card.tick = (card.tick + dt) % 1
      card.x = currentX
      card.y = currentY
      // card.width = width
      // card.height = height

      // Если карта достигла цели, завершаем анимацию
      if (currentX >= targetX && currentY >= targetY) {
        app?.ticker.remove(move)
      }
    }

    // Добавляем цвет подсветки карты
    // card.beginFill(color).drawRect(-width / 2, -height / 2, width, height).endFill()

    // Запускаем анимацию
    // const moveInterval = setInterval(move, 30) // 60 fps
    // app!.ticker.add(move)
    app?.ticker.add(move)
  }

  const initPixiApp = async () => {
    await nextTick()
    app = new Application()

    await app.init({
      width: 360,
      height: 640,
      backgroundColor: 0x000000,
      antialias: true,
    })

    if (canvasRef.value) {
      canvasRef.value.appendChild(app.canvas as HTMLCanvasElement)
    }

    renderScene()
  }
  const performBattle = async () => {
    const playerCard = playerDeck.value[activePlayerCardIndex.value]
    const enemyCard = enemyDeck.value[activeEnemyCardIndex.value]

    // Animate card movement to the center of the screen
    // const playerCardGraphics = drawCard(playerCard, 50 + (activePlayerCardIndex.value * 60), 550)
    // const enemyCardGraphics = drawCard(enemyCard, 50 + (activeEnemyCardIndex.value * 60), 50)

    // Перемещение активных карт в центр экрана
    animateCardMovement(playerDeckGp[activePlayerCardIndex.value], 180, 400, true)
    animateCardMovement(enemyDeckGp[activeEnemyCardIndex.value], 180, 240, false)

    // app?.stage.addChild(playerCardGraphics)
    // app?.stage.addChild(enemyCardGraphics)

    // Use a loop for attacking, but with delays handled differently
    while (playerCard.hp > 0 || enemyCard.hp > 0) {
      // Simulate attack
      enemyCard.shield -= playerCard.damage
      if (enemyCard.shield < 0) {
        enemyCard.hp += enemyCard.shield
        enemyCard.shield = 0
      }

      // Instead of `await` in the loop, just use `delay`
      // eslint-disable-next-line no-await-in-loop,no-use-before-define
      await delay(animationDuration)

      playerCard.shield -= enemyCard.damage
      if (playerCard.shield < 0) {
        playerCard.hp += playerCard.shield
        playerCard.shield = 0
      }

      // eslint-disable-next-line no-await-in-loop,no-use-before-define
      await delay(animationDuration)

      renderScene()
    }

    if (playerCard.hp <= 0) {
      activePlayerCardIndex.value++
      if (activePlayerCardIndex.value >= playerDeck.value.length) {
        playerHealth.value -= enemyCard.damage
      }
    }

    if (enemyCard.hp <= 0) {
      activeEnemyCardIndex.value++
      if (activeEnemyCardIndex.value >= enemyDeck.value.length) {
        enemyHealth.value -= playerCard.damage
      }
    }

    renderScene()

    if (playerHP.value > 0 || enemyHP.value > 0) {
      performBattle()
    } else {
      isBattleActive.value = false
    }
  }

  const startBattle = async () => {
    isBattleActive.value = true
    await nextTick()
    renderScene()
    performBattle()
  }

  function delay(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }

  onMounted(() => {
    initPixiApp()
  })

  onUnmounted(() => {
    app?.destroy(true, { children: true })
  })
</script>

<template>
  <div ref="canvasRef" style="width: 100%; height: 100%; position: relative;">
    <button
      v-if="!isBattleActive"
      style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);"
      type="button"
      @click="startBattle"
    >
      Start Battle
    </button>
  </div>
</template>

<style scoped>
div {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}
button {
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  font-size: 16px;
  border: none;
  cursor: pointer;
}
</style>
