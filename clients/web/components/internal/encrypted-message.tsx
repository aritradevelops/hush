'use client'
import { useMe } from "@/contexts/user-context";
import { Base64Utils } from "@/lib/base64";
import { AESGCM } from "@/lib/encryption";
import keysManager from "@/lib/internal/keys-manager";
import { cn } from "@/lib/utils";
import { UUID } from "crypto";
import { useEffect, useState } from "react";

interface EncryptedMessageProps {
  message: string;
  iv: string;
  channel_id: UUID;
  className?: string;
}

export function EncryptedMessage({ message, iv, channel_id, className }: EncryptedMessageProps) {
  const [decryptedMessage, setDecryptedMessage] = useState<string | null>(null);
  const { user } = useMe()

  const decryptMessage = async () => {
    const sharedSecret = await keysManager.getSharedSecret(channel_id, user.email)
    console.log(Base64Utils.encode(sharedSecret), iv)

    const decryptedMessage = await AESGCM.decrypt(message, iv, sharedSecret)
    return decryptedMessage
  }
  useEffect(() => {
    decryptMessage().then(setDecryptedMessage)
  }, [message, iv, channel_id])

  return (
    <span className={cn("text-sm text-muted-foreground break-words", className)}>
      {decryptedMessage ? decryptedMessage : "Decrypting..."}
    </span>
  )
}