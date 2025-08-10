import { useEffect, useState } from "react"

type DeviceInfo = {
  videoInputs: MediaDeviceInfo[]
  audioInputs: MediaDeviceInfo[]
  audioOutputs: MediaDeviceInfo[]
}

type MediaPermissions = {
  hasAudioPermission: boolean
  hasVideoPermission: boolean
}

type UseMediaDevicesResult = {
  devices: DeviceInfo
  permissions: MediaPermissions
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useMediaDevices(): UseMediaDevicesResult {
  const [devices, setDevices] = useState<DeviceInfo>({
    videoInputs: [],
    audioInputs: [],
    audioOutputs: [],
  })

  const [permissions, setPermissions] = useState<MediaPermissions>({
    hasAudioPermission: false,
    hasVideoPermission: false,
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = async () => {
    setLoading(true)
    setError(null)

    let hasVideoPermission = false
    let hasAudioPermission = false

    try {
      const supportsPermissionsAPI = typeof navigator.permissions?.query === "function"

      const cameraPerm = supportsPermissionsAPI
        ? await navigator.permissions.query({ name: "camera" as PermissionName })
        : null

      const micPerm = supportsPermissionsAPI
        ? await navigator.permissions.query({ name: "microphone" as PermissionName })
        : null

      const cameraState = cameraPerm?.state ?? "prompt"
      const micState = micPerm?.state ?? "prompt"

      if (cameraState === "granted") hasVideoPermission = true
      if (micState === "granted") hasAudioPermission = true

      const shouldFallback =
        cameraState === "prompt" || micState === "prompt" || !supportsPermissionsAPI

      if (shouldFallback) {
        // Attempt to get user media as a fallback
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })

        hasVideoPermission = stream.getVideoTracks().length > 0
        hasAudioPermission = stream.getAudioTracks().length > 0

        // Always stop media tracks after checking
        stream.getTracks().forEach((t) => t.stop())
      }

      setPermissions({ hasAudioPermission, hasVideoPermission })

      const allDevices = await navigator.mediaDevices.enumerateDevices()
      setDevices({
        videoInputs: allDevices.filter((d) => d.kind === "videoinput"),
        audioInputs: allDevices.filter((d) => d.kind === "audioinput"),
        audioOutputs: allDevices.filter((d) => d.kind === "audiooutput"),
      })
    } catch (err: any) {
      setError(err?.message ?? "Unknown error while checking media devices")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  return { devices, permissions, loading, error, refresh }
}
