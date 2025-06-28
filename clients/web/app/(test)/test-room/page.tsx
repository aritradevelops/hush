'use client'
import { constants } from "@/config/constants";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const socket = io(constants.SERVER_URL, { withCredentials: true });

const iceServerConfig: RTCConfiguration = {
  iceServers: [
    { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }
  ]
};

interface ICallContext {
  readonly peers: [string, RTCPeerConnection, MediaStream][];
  readonly localStream?: MediaStream;
}

const CallContext = createContext<ICallContext | undefined>(undefined);

const CallContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [peers, setPeers] = useState<[string, RTCPeerConnection, MediaStream][]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | undefined>();
  const peersRef = useRef(peers);

  useEffect(() => {
    peersRef.current = peers;
  }, [peers]);

  useEffect(() => {
    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      setLocalStream(stream);
      socket.emit("relay", { type: "call:joined" });
    };
    init();
  }, []);

  const newPeer = async (id: string, s: Socket) => {
    if (peersRef.current.find(([i]) => i === id)) return;
    if (!localStream) return;

    console.log("new peer joined ", id);

    const peer = new RTCPeerConnection(iceServerConfig);
    const remoteStream = new MediaStream();

    localStream.getTracks().forEach(track => peer.addTrack(track, localStream));

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
          newPeer(data.from, socket);
          break;
        case 'call:left': {
          const idx = peersRef.current.findIndex(w => w[0] === data.from);
          if (idx !== -1) {
            peersRef.current[idx][1].close();
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
            const peer = new RTCPeerConnection(iceServerConfig);
            const remoteStream = new MediaStream();

            peer.onicecandidate = (e) => {
              if (e.candidate) {
                socket.emit("relay", { candidate: e.candidate, type: 'ice:candidate', to: data.from });
              }
            };

            peer.ontrack = (e) => {
              remoteStream.addTrack(e.track);
            };

            await peer.setRemoteDescription(new RTCSessionDescription(data.offer));

            if (localStream) {
              localStream.getTracks().forEach(t => peer.addTrack(t, localStream));
            }

            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            socket.emit("relay", { answer, type: 'ice:answer', to: data.from });

            setPeers(p => [...p, [data.from, peer, remoteStream]]);
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
      socket.emit("relay", { type: "call:left" });
      socket.off("relay", handleRelayEvent);
    };
  }, [localStream]);

  return <CallContext.Provider value={{ peers, localStream }}>{children}</CallContext.Provider>;
};

export default function Page() {
  return (
    <CallContextProvider>
      <Conference />
    </CallContextProvider>
  );
}

function Conference() {
  const { peers, localStream } = useContext(CallContext)!;
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  return (
    <div className="w-full h-screen flex justify-center items-center gap-2 flex-wrap">
      <div className="w-[480px] h-auto border-2 border-white rounded-md" key="local">
        <video ref={localVideoRef} className="rotate-y-180" autoPlay playsInline muted />
      </div>
      {peers.map(([id, _, stream]) => (
        <div className="w-[480px] h-auto border-2 border-white rounded-md relative" key={id}>
          <div className="absolute top-5 left-[50%] translate-x-[-50%] text-white">{id}</div>
          <video
            autoPlay
            playsInline
            ref={r => {
              if (r && stream) r.srcObject = stream;
            }}
            className="object-contain"
          />
        </div>
      ))}
    </div>
  );
}
