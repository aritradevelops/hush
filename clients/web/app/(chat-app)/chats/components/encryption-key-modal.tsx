"use client"

import type React from "react"

import { Message } from "@/components/message"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RSAKeyPair } from "@/lib/encryption"
import secretManager from "@/lib/internal/keys-manager"
import { Download, Key, Lock, Upload } from "lucide-react"
import { useEffect, useState } from "react"
import httpClient from "@/lib/http-client"
import { useMe } from "@/contexts/user-context"

export function EncryptionKeyModal() {
  const [open, setOpen] = useState(false)
  const { user } = useMe()
  // Since UserDataLoader ensures user is loaded, we can be sure user exists here
  useEffect(() => {
    if (user) {
      // Use email as a unique identifier for the key storage
      secretManager.getEncryptionKey(user.email).then(data => {
        if (!data) {
          setOpen(true)
        }
      })
    }
  }, [user])

  const [key, setKey] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [keyGenerated, setKeyGenerated] = useState(false)
  const [downloadLink, setDownloadLink] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const handleGenerateKey = async () => {
    if (!user) {
      return
    }
    setGenerating(true)
    const { privateKey, publicKey } = await RSAKeyPair.generate()
    await httpClient.createPublicKey({ key: publicKey, user_id: user.id })
    // store on db with user email as identifier
    await secretManager.setEncryptionKey(privateKey, user.email)
    const privateKeyPem = RSAKeyPair.formatPEM(privateKey, "PRIVATE KEY")
    const pemFile = new Blob([privateKeyPem], { type: "application/x-pem-file" });
    setKey(privateKey)
    setDownloadLink(URL.createObjectURL(pemFile))
    setGenerating(false)
    setKeyGenerated(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
      setImportError(null)
    }
  }

  const handleImportKey = async () => {
    if (!selectedFile) {
      setImportError("Please select a file first")
      return
    }

    try {
      // TODO: validate
      const privateKeyPem = await selectedFile.text()
      const privateKey = RSAKeyPair.importPem(privateKeyPem)
      setKey(privateKey)
      // Store with user email as identifier if available
      await secretManager.setEncryptionKey(privateKey, user?.email)
      setOpen(false)
    } catch (error) {
      setImportError("Failed to import key. Please ensure it's a valid encryption key file.")
    }
  }

  const handleClose = () => {
    // Only allow closing if a key has been set
    if (key) {
      setOpen(false)
    }
  }
  // Still render the modal even if user data isn't loaded yet
  // Only disable actions that require user data
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Encryption Key Required
          </DialogTitle>
          <DialogDescription>
            An encryption key is required to secure your messages. This key will be stored locally on your device only.
          </DialogDescription>
        </DialogHeader>

        {/* <Alert className="bg-amber-50 border-amber-200 text-amber-800">
          <AlertTitle className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Important Security Information
          </AlertTitle>
          <AlertDescription>
            Your encryption key is used to encrypt and decrypt your messages. If you lose this key, you will not be able
            to access your previous conversations.
          </AlertDescription>
        </Alert> */}
        <Message message="Your encryption key is used to encrypt and decrypt your messages. If you lose this key, you will not be able
            to access your previous conversations." variant={"warning"} />

        <Tabs defaultValue="generate">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Generate New Key</TabsTrigger>
            <TabsTrigger value="import">Use Existing Key</TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <Card>
              <CardHeader>
                <CardTitle>Generate a New Encryption Key</CardTitle>
                <CardDescription>Create a new encryption key for your Hush Chat account.</CardDescription>
              </CardHeader>
              <CardContent>
                {keyGenerated ? (
                  <div className="space-y-4">
                    {/* <Alert className="bg-green-50 border-green-200 text-green-800">
                      <AlertDescription>
                        Your key has been generated and saved to this device. Please download a backup copy.
                      </AlertDescription>
                    </Alert> */}
                    <Message variant={"success"} message="Your key has been generated and saved to this device. Please download a backup copy." />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Click the button below to generate a secure encryption key. This key will be used to encrypt your
                    messages.
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                {downloadLink ? (
                  <Button className="w-full">
                    <a href={downloadLink} download={`${user!.email}_hush_private_key.pem`} className="w-full flex justify-center items-center"><Download className="mr-2 h-4 w-4" />
                      Download Key</a>
                  </Button>
                ) : (
                  <Button onClick={handleGenerateKey} className="w-full" disabled={generating}>
                    <Key className="mr-2 h-4 w-4" />
                    {generating ? 'Generating Key...' : 'Generate Key'}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="import">
            <Card>
              <CardHeader>
                <CardTitle>Import Existing Key</CardTitle>
                <CardDescription>Use your existing encryption key to access your messages.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="key-file">Upload Key File</Label>
                  <Input id="key-file" type="file" onChange={handleFileChange} accept=".pem" />
                </div>
                {importError && (
                  <Message message={importError} variant={"error"} />
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={handleImportKey} className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Import Key
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
