"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Download, Key, Lock, Upload } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useIndexDb } from "@/hooks/use-indexdb"
import { RSAKeyPair } from "@/lib/encryption"
import { Message } from "@/components/message"
const PRIVATE_KEY_IDENTIFIER = 'hush_encryption_key'

export function EncryptionKeyModal() {
  const [open, setOpen] = useState(false)
  const db = useIndexDb()
  useEffect(() => {
    db.get<{ key: string, value: string }>(PRIVATE_KEY_IDENTIFIER).then(data => {
      console.log(data)
      if (!data) setOpen(true)
    })
  })

  const [key, setKey] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [keyGenerated, setKeyGenerated] = useState(false)
  const [downloadLink, setDownloadLink] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const handleGenerateKey = async () => {
    setGenerating(true)
    const { privateKey, publicKey } = await RSAKeyPair.generate()
    //TODO: sync with the server
    // store on db
    await db.set(PRIVATE_KEY_IDENTIFIER, privateKey)
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
      console.log(privateKey)
      setKey(privateKey)
      db.set(PRIVATE_KEY_IDENTIFIER, privateKey)
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
                    <a href={downloadLink} download="hush_private_key.pem" className="w-full flex justify-center items-center"><Download className="mr-2 h-4 w-4" />
                      Download Key</a>
                  </Button>
                ) : (
                  <Button onClick={handleGenerateKey} className="w-full">
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
