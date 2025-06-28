Client (Browser) 
   |
   |--> Connect to signaling server (e.g., WebSocket)
   |
   |--> "join room" -> Server
                     |
                     |--> If router not created for room, create router
                     |--> Create mediasoup `WebRtcTransport` (send + recv) for client
                     |
   |<-- Send transport options (ICE, DTLS params) <-- Server
   |
   |--> Use transport options to connect WebRTC (setRemoteDesc etc.)
   |
   |--> "connect-transport" with DTLS params -> Server
                     |
                     |--> Call `transport.connect({ dtlsParameters })`
   |
   |--> "produce" with RTP params (camera/mic) -> Server
                     |
                     |--> Call `transport.produce({ kind, rtpParameters })`
                     |
                     |--> Store producer, notify other clients
   |
   |<-- Other client joins, server creates consumer for this producer
                     |
                     |--> `transport.consume({ producerId })` for each consumer
   |
   |<-- Server sends consumer parameters (id, kind, rtpParameters)
   |
   |--> "resume" -> Server
                     |
                     |--> Call `consumer.resume()` to start receiving media

