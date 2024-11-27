export const useP2pStore = defineStore('p2p', () => {
  const peerConnection = ref<RTCPeerConnection>()
  const dataChannel = ref<RTCDataChannel>()
  const offer = ref<RTCLocalSessionDescriptionInit>()
  const answer = ref<RTCSessionDescriptionInit>()
  const iceCandidates = ref<RTCIceCandidate[]>([])
  const isInitiator = ref(false)
  const connectedPeers = ref([])
  async function initializePeerConnection() {
    peerConnection.value = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }], // STUN server for ICE negotiation
    });

    // Handle ICE candidates
    peerConnection.value.onicecandidate = (event) => {
      if (event.candidate) {
        broadcastIceCandidate(event.candidate);
      }
    };

    // Listen for incoming data channels
    peerConnection.value.ondatachannel = (event) => {
      dataChannel.value = event.channel;
      setupDataChannel();
    };
  }

  async function createPeerConnection() {
    peerConnection.value = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    peerConnection.value.onicecandidate = (event) => {
      console.log("RECEIVED ICE CANDIDATE", event.candidate);
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
    isInitiator.value = true;
    dataChannel.value = peerConnection.value!.createDataChannel('signal');
    setupDataChannel();
    dataChannel.value.onopen = async () => {
      console.log('Data channel is open, creating an offer...');
  
      const offer = await peerConnection.value!.createOffer();
      await peerConnection.value!.setLocalDescription(offer);
  
      // Broadcast the offer only when the data channel is ready
      broadcastSignalingMessage({ offer });
    };
    const offer = await peerConnection.value!.createOffer();
    await peerConnection.value!.setLocalDescription(offer);

    // Broadcast the offer to peers
    broadcastSignalingMessage({ offer });
  }

  async function handleOffer(offer: RTCSessionDescriptionInit) {
    if (!peerConnection) await initializePeerConnection();

    await peerConnection.value!.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await peerConnection.value!.createAnswer();
    await peerConnection.value!.setLocalDescription(answer);

    // Send answer back to the initiator
    broadcastSignalingMessage({ answer });
  }
  async function handleAnswer(answer: RTCSessionDescriptionInit) {
    await peerConnection.value!.setRemoteDescription(new RTCSessionDescription(answer));
  }

  async function addIceCandidate(candidate: RTCIceCandidateInit | undefined) {
    await peerConnection.value!.addIceCandidate(new RTCIceCandidate(candidate));
  }

  function setupDataChannel() {
    dataChannel.value!.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received signaling message:', data);
  
      if (data.offer) handleOffer(data.offer);
      if (data.answer) handleAnswer(data.answer);
      if (data.candidate) addIceCandidate(data.candidate);
    };
  
    dataChannel.value!.onopen = () => {
      console.log('Data channel is open');
    };
  
    dataChannel.value!.onclose = () => {
      console.log('Data channel closed');
    };
  }

  function broadcastSignalingMessage(message: { offer?: RTCSessionDescriptionInit; answer?: RTCSessionDescriptionInit; candidate?: any; }) {
    const jsonString = JSON.stringify(message);

    // Send via data channel if connected
    if (dataChannel && dataChannel.value!.readyState === 'open') {
      dataChannel.value!.send(jsonString);
    } else {
      console.warn('Data channel not ready for signaling');
    }
  }

  function broadcastIceCandidate(candidate: RTCIceCandidate) {
    broadcastSignalingMessage({ candidate });
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
  // async function addIceCandidate(candidate: RTCIceCandidateInit | undefined) {
  //   await peerConnection.value!.addIceCandidate(new RTCIceCandidate(candidate));
  // }

  return {
    peerConnection,
    dataChannel,
    offer,
    answer,
    iceCandidates,
    connectedPeers,
    initializePeerConnection,
    createPeerConnection,
    createOffer,
    setRemoteOffer,
    setRemoteAnswer,
    addIceCandidate,
  }
});
