<script setup lang="ts">
import { ref } from 'vue';

const initialize = async () => {
  await store.initializePeerConnection();

  // If this device is initiating
  const isInitiator = confirm('Are you the initiator?'); // Temporary toggle, replace with logic
  if (isInitiator) {
    await store.createOffer();
  }
};

const store = useP2pStore();

const offerText = ref('');
const candidateText = ref('');

const initConnection = async () => {
  await store.createPeerConnection();
};

const generateOffer = async () => {
  await store.createOffer();
  offerText.value = JSON.stringify(store.offer);
};

const setRemote = async () => {
  const remoteOfferOrAnswer = JSON.parse(offerText.value);
  if (remoteOfferOrAnswer.type === 'offer') {
    await store.setRemoteOffer(remoteOfferOrAnswer);
    offerText.value = JSON.stringify(store.answer);
  } else {
    await store.setRemoteAnswer(remoteOfferOrAnswer);
  }
};

const addCandidate = async () => {
  const candidate = JSON.parse(candidateText.value);
  await store.addIceCandidate(candidate);
};

const sendMessage = () => {
  if (store.dataChannel) {
    store.dataChannel.send('Hello from P2P Nuxt!');
  }
};

</script>
<template>
  <v-app>
    <v-main>
      <vite-pwa-manifest />
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>


      <div>
        <h1>WebRTC Automatic P2P</h1>
        <button @click="initialize">Start Discovery</button>
        <p v-if="store.connectedPeers.length">Connected Peers: {{ store.connectedPeers.length }}</p>
      </div>


      <div v-if="false" style="display:flex; flex-direction: column; gap: 10px">
        <button @click="initConnection">Initialize Connection</button>
        <button @click="generateOffer">Generate Offer</button>
        <textarea v-model="offerText" placeholder="Offer/Answer"></textarea>
        <button @click="setRemote">Set Remote Description</button>
        <textarea v-model="candidateText" placeholder="ICE Candidate"></textarea>
        <button @click="addCandidate">Add ICE Candidate</button>
        <button @click="sendMessage">Send Message</button>
        <span v-for="candidate in store.iceCandidates">
          {{ candidate }}
        </span>
      </div>
    </v-main>
  </v-app>
</template>
