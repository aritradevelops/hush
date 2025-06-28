'use client'
import { constants } from "@/config/constants";
import { Base64Utils } from "@/lib/base64";
import { AESCTR } from "@/lib/encryption";
import { Camera, CameraOff, Mic, MicOff, ScreenShare } from "lucide-react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const socket = io(constants.SERVER_URL, { withCredentials: true });
const sharedSecret = "mo6wtNFN3x5tN+UaWB1/oO6Fk/kn7o9NEDrApazsymQ="
const counter = "ydBoaNtNQO4Mkuby5Q702Q=="
const iceServerConfig: RTCConfiguration = {
  encodedInsertableStreams: true,
  iceServers: [
    { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }
  ]
};

interface ICallContext {
  readonly peers: [string, RTCPeerConnection, MediaStream][];
  readonly localStream: MediaStream | undefined;
  readonly localScreenStream: MediaStream | undefined;
  readonly isMuted: boolean;
  toggleMute: () => void;
  readonly videoEnabled: boolean;
  toggleVideo: () => void;
  shareScreen: () => void;
}

const CallContext = createContext<ICallContext | undefined>(undefined);

const CallContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [peers, setPeers] = useState<[string, RTCPeerConnection, MediaStream][]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | undefined>();
  const [localScreenStream, setLocalScreenStream] = useState<MediaStream | undefined>();
  const [isMuted, setIsMuted] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const peersRef = useRef(peers);
  const toggleMute = () => {
    if (!localStream) return;
    localStream.getTracks().forEach(track => {
      if (track.kind === 'audio') {
        track.enabled = !track.enabled;
      }
    });
    setIsMuted(m => !m);
  };
  const toggleVideo = () => {
    if (!localStream) return
    localStream.getTracks().forEach(track => {
      if (track.kind === 'video') {
        track.enabled = !track.enabled;
      }
    });
    setVideoEnabled(v => !v)
  }
  const shareScreen = async () => {
    const s = await navigator.mediaDevices.getDisplayMedia({ video: true })
    setLocalScreenStream(s)
    // for every peer create a new offer
    peersRef.current.forEach(([id, p, stream]) => {
      p.addTrack(s.getVideoTracks()[0], s)
      p.createOffer().then(sd => {
        p.setLocalDescription(sd)
        socket.emit("relay", { offer: sd, type: "ice:offer", to: id })
      })
    })
  }
  useEffect(() => {
    console.log("peers updated", peers);
    peersRef.current = peers;
  }, [peers]);

  useEffect(() => {
    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      setLocalStream(stream);
      console.log("emitting call:joined");
      socket.emit("relay", { type: "call:joined" });
    };
    init();
    const handleBeforeUnload = () => {
      console.log("unloading, emitting call:left");
      socket.emit("relay", { type: "call:left" });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // console.log("unmounting, emitting call:left");
      // socket.emit("relay", { type: "call:left" });
    }
  }, []);

  const newPeer = async (id: string, s: Socket) => {
    if (peersRef.current.find(([i]) => i === id)) return;
    if (!localStream) return;

    console.log("new peer joined ", id);

    const peer = new RTCPeerConnection(iceServerConfig);
    const remoteStream = new MediaStream();
    localStream.getTracks().forEach(track => peer.addTrack(track, localStream));
    const sender = peer.getSenders().find(s => s.track?.kind === 'video');
    const senderStreams = sender!.createEncodedStreams!();
    const readableSend = senderStreams.readable;
    const writableSend = senderStreams.writable;
    const transformStreamEncrypt = new TransformStream({
      async transform(chunk, controller) {
        // Encrypt `chunk.data` with AES
        const { encrypted } = await AESCTR.encrypt(chunk.data, Base64Utils.decode(sharedSecret), counter)

        chunk.data = encrypted;
        controller.enqueue(chunk);
      }
    });
    readableSend.pipeThrough(transformStreamEncrypt).pipeTo(writableSend)
    const receiver = peer.getReceivers().find(r => r.track.kind === 'video');
    const { readable: readableRecv, writable: writableRecv } = receiver!.createEncodedStreams!();

    const decryptStream = new TransformStream({
      async transform(chunk, controller) {
        const { decrypted } = await AESCTR.decrypt(chunk.data, counter, Base64Utils.decode(sharedSecret))
        chunk.data = decrypted;
        controller.enqueue(chunk);
      }
    });

    readableRecv.pipeThrough(decryptStream).pipeTo(writableRecv);

    peer.onicecandidate = (e) => {
      console.log(`ICE candidate for peer ${id}: `, e.candidate);
      if (e.candidate) {
        s.emit("relay", { candidate: e.candidate, type: 'ice:candidate', to: id });
      }
    };

    peer.ontrack = (e) => {
      remoteStream.addTrack(e.track);
    };

    setPeers(p => [...p, [id, peer, remoteStream]]);

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    s.emit("relay", { offer, type: "ice:offer", to: id });
  };

  useEffect(() => {
    const handleRelayEvent = (data: { type: string; from: string; offer?: any; answer?: any; candidate?: any }) => {
      switch (data.type) {
        case 'call:joined':
          console.log("call:joined event received");
          newPeer(data.from, socket);
          break;
        case 'call:left': {
          console.log("call:left event received");
          const idx = peersRef.current.findIndex(w => w[0] === data.from);
          if (idx !== -1) {
            peersRef.current[idx][1].close();
            console.log(`Peer ${data.from} left the call`);
            setPeers(p => [...p.slice(0, idx), ...p.slice(idx + 1)]);
          }
          break;
        }
        case 'ice:candidate': {
          const peer = peersRef.current.find(([id]) => id === data.from)?.[1];
          if (peer) {
            peer.addIceCandidate(new RTCIceCandidate(data.candidate));
          }
          break;
        }
        case 'ice:offer': {
          (async () => {
            // if () return;
            const existing = peersRef.current.find(([id]) => id === data.from)
            let peer: RTCPeerConnection, remoteStream: MediaStream
            if (existing) {
              peer = existing[1]
              remoteStream = existing[2]
              console.log('on ice candidate', peer.onicecandidate)
              console.log('on track', peer.ontrack)
            } else {
              peer = new RTCPeerConnection(iceServerConfig);
              remoteStream = new MediaStream();
              peer.onicecandidate = (e) => {
                if (e.candidate) {
                  socket.emit("relay", { candidate: e.candidate, type: 'ice:candidate', to: data.from });
                }
              };

              peer.ontrack = (e) => {
                console.log('track')
                remoteStream.addTrack(e.track);
              };

              if (localStream) {
                localStream.getTracks().forEach(t => peer.addTrack(t, localStream));
                const sender = peer.getSenders().find(s => s.track?.kind === 'video');
                const senderStreams = sender!.createEncodedStreams!();
                const readableSend = senderStreams.readable;
                const writableSend = senderStreams.writable;
                const transformStreamEncrypt = new TransformStream({
                  async transform(chunk, controller) {
                    // Encrypt `chunk.data` with AES
                    const { encrypted } = await AESCTR.encrypt(chunk.data, Base64Utils.decode(sharedSecret), counter)

                    chunk.data = encrypted;
                    controller.enqueue(chunk);
                  }
                });
                readableSend.pipeThrough(transformStreamEncrypt).pipeTo(writableSend)
                const receiver = peer.getReceivers().find(r => r.track.kind === 'video');
                const { readable: readableRecv, writable: writableRecv } = receiver!.createEncodedStreams!();

                const decryptStream = new TransformStream({
                  async transform(chunk, controller) {
                    const { decrypted } = await AESCTR.decrypt(chunk.data, counter, Base64Utils.decode(sharedSecret))
                    chunk.data = decrypted;
                    controller.enqueue(chunk);
                  }
                });

                readableRecv.pipeThrough(decryptStream).pipeTo(writableRecv);
              }
              setPeers(p => [...p, [data.from, peer, remoteStream]]);

            }
            await peer.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            socket.emit("relay", { answer, type: 'ice:answer', to: data.from });
          })();
          break;
        }
        case 'ice:answer': {
          const peer = peersRef.current.find(([id]) => id === data.from)?.[1];
          if (peer) {
            peer.setRemoteDescription(new RTCSessionDescription(data.answer));
          }
          break;
        }
      }
    };

    socket.on("relay", handleRelayEvent);
    return () => {
      socket.off("relay", handleRelayEvent);
    };
  }, [localStream]);

  return <CallContext.Provider value={{ peers, localStream, localScreenStream, isMuted, videoEnabled, toggleMute, toggleVideo, shareScreen }}>{children}</CallContext.Provider>;
};

export default function Page() {
  return (
    <CallContextProvider>
      <Conference />
    </CallContextProvider>
  );
}

function Conference() {
  const { peers, localStream, localScreenStream, isMuted, videoEnabled, toggleMute, toggleVideo, shareScreen } = useContext(CallContext)!;
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localScreenVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);
  useEffect(() => {
    if (localScreenVideoRef.current && localScreenStream) {
      localScreenVideoRef.current.srcObject = localScreenStream;
    }
  }, [localScreenStream]);

  return (
    <div className="w-full h-screen flex flex-col bg-black">
      <div className="w-full h-[80%] flex justify-center items-center gap-2 flex-wrap">
        <div className="h-full max-h-[40vh] aspect-video border-2 border-white rounded-md relative" key="local">
          <video
            ref={localVideoRef}
            className="w-full h-full object-contain rotate-y-180"
            autoPlay
            playsInline
            muted
          />
          {localStream && <AudioLevelIndicator stream={localStream} key={'audio-meter' + 'me'} />}
        </div>

        {localScreenStream && <div className="h-full max-h-[40vh] aspect-video border-2 border-white rounded-md relative" key="local-screen">
          <video
            ref={localScreenVideoRef}
            className="w-full h-full object-contain"
            autoPlay
            playsInline
            muted
          />
        </div>}

        {peers.map(([id, _, stream]) => {
          console.log("video tracks", stream.getVideoTracks().length)
          return (
            <div
              className="h-full max-h-[40vh] aspect-video border-2 border-white rounded-md relative"
              key={id}
            >
              <div className="absolute top-2 left-1/2 -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-2 rounded">
                {id}
              </div>
              <video
                autoPlay
                playsInline
                ref={r => {
                  if (r && stream) r.srcObject = stream;
                }}
                className="w-full h-full object-contain"
              />
              <AudioLevelIndicator stream={stream} key={'audio-meter' + id} />
            </div>
          )
        })}

      </div>
      <div className="w-full flex-1 flex gap-2 justify-center items-center">
        <div className="w-10 h-10 rounded-full bg-gray-700 flex justify-center items-center cursor-pointer">
          {isMuted ? (
            <MicOff className="text-white" onClick={toggleMute} />
          ) : (
            <Mic className="text-white" onClick={toggleMute} />
          )}
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-700 flex justify-center items-center cursor-pointer">
          {
            videoEnabled ? (
              <Camera className="text-white" onClick={toggleVideo} />
            ) : (
              <CameraOff className="text-white" onClick={toggleVideo} />
            )
          }
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-700 flex justify-center items-center cursor-pointer">
          <ScreenShare className="text-white" onClick={shareScreen} />
        </div>
      </div>
    </div>
  );
}

function AudioLevelIndicator({ stream }: { stream: MediaStream }) {
  const [volume, setVolume] = useState(0);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (!stream || !stream.getAudioTracks().length) return;
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    source.connect(analyser);
    analyserRef.current = analyser;

    const updateVolume = () => {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      setVolume(avg);
      requestAnimationFrame(updateVolume);
    };

    updateVolume();


    return () => {
      source.disconnect();
      analyser.disconnect();
      audioContext.close();
    };
  }, [stream]);

  return (
    <div className="absolute bottom-2 left-2 w-24 h-2 bg-gray-700 rounded overflow-hidden">
      <div
        className="h-full bg-green-500 transition-all duration-100 ease-linear"
        style={{ width: `${volume}%` }}
      />
    </div>
  );
}