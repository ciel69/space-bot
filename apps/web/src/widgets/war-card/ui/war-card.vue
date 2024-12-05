<script setup lang="ts">
  import { computed, nextTick, onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
  import { Application, Graphics, Text, TextStyle } from 'pixi.js'
  import { hapticFeedback } from '@telegram-apps/sdk-vue'

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

  const updateCardText = (cardGraphics: Graphics, card: Card) => {
    const [hpText, shieldText, damageText] = cardGraphics.children as Text[]

    hpText.text = `HP: ${card.hp}`
    shieldText.text = `Shield: ${card.shield}`
    damageText.text = `DMG: ${card.damage}`
  }

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

    // Убедитесь, что не удаляете старые карты, а обновляете их
    app.stage.removeChildren()

    // Отображение оставшихся карт игрока
    playerDeck.value.forEach((card, index) => {
      const cardGraphics = playerDeckGp[index] || drawCard(card, 50 + (index * 80), 570)
      if (!playerDeckGp[index]) {
        playerDeckGp.push(cardGraphics)
      }
      if (!app!.stage.children.includes(cardGraphics)) {
        app!.stage.addChild(cardGraphics)
      }
    })

    // Отображение оставшихся карт противника
    enemyDeck.value.forEach((card, index) => {
      const cardGraphics = enemyDeckGp[index] || drawCard(card, 50 + (index * 80), 70)
      if (!enemyDeckGp[index]) {
        enemyDeckGp.push(cardGraphics)
      }
      if (!app!.stage.children.includes(cardGraphics)) {
        app!.stage.addChild(cardGraphics)
      }
    })
  }

  const animateCardMovement = (card: Graphics, targetX: number, targetY: number) => {
    if (!card) return
    const speed = 5 // Скорость перемещения
    const startX = card.x
    const startY = card.y

    let progress = 0 // Прогресс анимации (от 0 до 1)

    const move = () => {
      progress += speed / 100 // Увеличиваем прогресс
      if (progress >= 1) {
        progress = 1 // Ограничиваем прогресс до 1
      }

      // Линейная интерполяция позиций
      card.x = startX + ((targetX - startX) * progress)
      card.y = startY + ((targetY - startY) * progress)

      // Если анимация завершена, удаляем тикер
      if (progress === 1) {
        if (hapticFeedback.impactOccurred.isAvailable()) {
          hapticFeedback.impactOccurred('soft')
        }
        app?.ticker.remove(move)
      }
    }

    // Добавляем карту на `stage`, если она ещё не добавлена
    if (!app?.stage.children.includes(card)) {
      app?.stage.addChild(card)
    }

    // Запускаем анимацию
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

    const playerCardGraphics = playerDeckGp[activePlayerCardIndex.value]
    const enemyCardGraphics = enemyDeckGp[activeEnemyCardIndex.value]

    // Анимация перемещения в центр
    await Promise.all([
      animateCardMovement(playerCardGraphics, 180, 400),
      animateCardMovement(enemyCardGraphics, 180, 240),
    ])

    // Бой до тех пор, пока HP не закончится у одной из карт
    while (playerCard.hp > 0 && enemyCard.hp > 0) {
      // Урон противнику
      enemyCard.shield -= playerCard.damage
      if (enemyCard.shield < 0) {
        enemyCard.hp += enemyCard.shield
        enemyCard.shield = 0
      }
      updateCardText(enemyCardGraphics, enemyCard)

      // eslint-disable-next-line no-use-before-define,no-await-in-loop
      await delay(animationDuration)

      // Урон игроку
      playerCard.shield -= enemyCard.damage
      if (playerCard.shield < 0) {
        playerCard.hp += playerCard.shield
        playerCard.shield = 0
      }
      updateCardText(playerCardGraphics, playerCard)

      // eslint-disable-next-line no-use-before-define,no-await-in-loop
      await delay(animationDuration)
    }

    // Проверка на смерть карт
    if (playerCard.hp <= 0) {
      activePlayerCardIndex.value++
      if (activePlayerCardIndex.value < playerDeck.value.length) {
        renderScene()
      } else {
        playerHealth.value -= enemyCard.damage
      }
    }

    if (enemyCard.hp <= 0) {
      activeEnemyCardIndex.value++
      if (activeEnemyCardIndex.value < enemyDeck.value.length) {
        renderScene()
      } else {
        enemyHealth.value -= playerCard.damage
      }
    }

    // Следующий раунд
    if (playerHP.value > 0 && enemyHP.value > 0) {
      performBattle()
    } else {
      isBattleActive.value = false
    }
  }

  const startBattle = async () => {
    isBattleActive.value = true
    await nextTick()
    renderScene() // Убедимся, что графика всех карт отрисована

    // Перемещение активных карт
    // animateCardMovement(playerDeckGp[activePlayerCardIndex.value], 180, 400, true)
    // animateCardMovement(enemyDeckGp[activeEnemyCardIndex.value], 180, 240, false)

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
