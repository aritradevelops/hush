import { Peer } from './peer'
import { Socket } from 'socket.io-client'

export class PeerManager {
  private peers = new Map<string, Peer>()

  constructor(private socket: Socket, private localStream: MediaStream) { }

  addPeer(id: string): Peer {
    if (!this.peers.has(id)) {
      const peer = new Peer(id, this.socket, this.localStream)
      this.peers.set(id, peer)
    }
    return this.peers.get(id)!
  }

  getPeer(id: string): Peer | undefined {
    return this.peers.get(id)
  }

  hasPeer(id: string): boolean {
    return this.peers.has(id)
  }

  getAllPeers(): Peer[] {
    return Array.from(this.peers.values())
  }

  removePeer(id: string) {
    const peer = this.peers.get(id)
    if (peer) {
      peer.close() // cleanup
      this.peers.delete(id)
    }
  }

  async createOfferFor(id: string): Promise<RTCSessionDescriptionInit> {
    const peer = this.addPeer(id)
    const offer = await peer.createOffer()
    await peer.setLocalDescription(offer)
    return offer
  }

  async handleOffer(from: string, offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    const peer = this.addPeer(from)
    if (!peer.remoteDescription) {
      await peer.setRemoteDescription(offer)
      const answer = await peer.createAnswer()
      await peer.setLocalDescription(answer)
      return answer
    }
    throw new Error('Remote description already set')
  }

  async handleAnswer(from: string, answer: RTCSessionDescriptionInit) {
    const peer = this.peers.get(from)
    if (peer) {
      await peer.setRemoteDescription(answer)
    }
  }

  async handleIceCandidate(from: string, candidate: RTCIceCandidate) {
    const peer = this.peers.get(from)
    if (peer) {
      await peer.addIceCandidate(candidate)
    }
  }

  closeAll() {
    for (const peer of this.peers.values()) {
      peer.close()
    }
    this.peers.clear()
  }
}
