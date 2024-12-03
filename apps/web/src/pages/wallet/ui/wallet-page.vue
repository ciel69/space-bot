<script setup lang="ts">
  import { computed } from 'vue'
  import { DisplayDataRow } from '@/shared/ui/ui-display-data/ui-display-data.vue'
  import { TonConnectButton, useTonWallet } from '@/shared/tonconnect'
  import { UiPage } from '@/shared/ui/ui-page'
  import { UiLink } from '@/shared/ui/ui-link'
  import { UiDisplayData } from '@/shared/ui/ui-display-data'

  const { wallet } = useTonWallet()

  const walletExtended = computed(() => (wallet.value && 'imageUrl' in wallet.value ? wallet.value : null))

  const rows = computed<DisplayDataRow[]>(() => (wallet.value ? [
    { title: 'Address', value: wallet.value.account.address },
    { title: 'Chain', value: wallet.value.account.chain },
    { title: 'Public Key', value: wallet.value.account.publicKey },
  ] : []))
</script>

<template>
  <UiPage title="TON Connect">
    <p v-if="!wallet">To display the data related to the TON Connect, it is required to connect your wallet.</p>
    <template v-else>
      <div v-if="walletExtended" class="ton-connect-page__provider">
        <img
          alt="Provider logo"
          class="ton-connect-page__provider-image"
          height="60"
          :src="walletExtended.imageUrl"
          width="60"
        >
        <div class="ton-connect-page__provider-meta">
          <p class="ton-connect-page__provider-wallet-name">
            {{ walletExtended.name }}&nbsp;
            <span class="ton-connect-page__provider-app-name">
              {{ walletExtended.appName }}
            </span>
          </p>
          <UiLink :to="walletExtended.aboutUrl">
            About connected wallet
          </UiLink>
        </div>
      </div>
      <UiDisplayData :rows />
    </template>
    <div class="ton-connect-page__button-container">
      <TonConnectButton />
    </div>
  </UiPage>
</template>

<style scoped>
.ton-connect-page__button-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.ton-connect-page__provider {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 16px;
}

.ton-connect-page__provider-image {
  border-radius: 5px;
}

.ton-connect-page__provider-meta {
  display: flex;
  flex-direction: column;
}

.ton-connect-page__provider-wallet-name {
  font-weight: bold;
  font-size: 20px;
  margin: 0;
}

.ton-connect-page__provider-app-name {
  opacity: .4;
  font-weight: 400;
  font-size: 14px;
  vertical-align: top;
}
</style>
