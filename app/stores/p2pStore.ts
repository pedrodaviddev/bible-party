export const useP2pStore = defineStore('p2p', () => {
  const peerConnection = ref<RTCPeerConnection>()
  const dataChannel = ref<RTCDataChannel>()
  const offer = ref<RTCLocalSessionDescriptionInit>()
  const answer = ref<RTCSessionDescriptionInit>()
  const iceCandidates = ref<RTCIceCandidate[]>([])
  async function createPeerConnection() {
    peerConnection.value = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    peerConnection.value.onicecandidate = (event) => {
      if (event.candidate) {
        iceCandidates.value.push(event.candidate);
      }
    };

    peerConnection.value.ondatachannel = (event) => {
      dataChannel.value = event.channel;
      dataChannel.value.onmessage = (e) => console.log('Received:', e.data);
    };
  }
  async function createOffer() {
    dataChannel.value = peerConnection.value!.createDataChannel('chat');
    const newOffer = await peerConnection.value!.createOffer();
    await peerConnection.value!.setLocalDescription(newOffer);
    offer.value = newOffer;
  }
  async function setRemoteOffer(remoteOffer: RTCSessionDescriptionInit) {
    await peerConnection.value!.setRemoteDescription(new RTCSessionDescription(remoteOffer));
    const newAnswer = await peerConnection.value!.createAnswer();
    await peerConnection.value!.setLocalDescription(newAnswer);
    answer.value = newAnswer;
  }
  async function setRemoteAnswer(remoteAnswer: RTCSessionDescriptionInit) {
    await peerConnection.value!.setRemoteDescription(new RTCSessionDescription(remoteAnswer));
  }
  async function addIceCandidate(candidate: RTCIceCandidateInit | undefined) {
    await peerConnection.value!.addIceCandidate(new RTCIceCandidate(candidate));
  }

  return {
    peerConnection,
    dataChannel,
    offer,
    answer,
    iceCandidates,
    createPeerConnection,
    createOffer,
    setRemoteOffer,
    setRemoteAnswer,
    addIceCandidate,
  }
});
