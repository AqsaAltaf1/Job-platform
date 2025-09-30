"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { linkedinAuth } from "@/lib/linkedin-auth"
import { showToast } from "@/lib/toast"

export default function LinkedInCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        if (error) {
          setStatus('error')
          if (error === 'unauthorized_scope_error') {
            setMessage('LinkedIn app configuration error: Some requested permissions are not authorized. Please contact support.')
          } else {
            setMessage(`LinkedIn authentication failed: ${error}`)
          }
          return
        }

        if (!code || !state) {
          setStatus('error')
          setMessage('Missing authorization code or state parameter')
          return
        }

        // Exchange code for access token
        const tokenResponse = await linkedinAuth.exchangeCodeForToken(code, state)
        
        // Store access token
        linkedinAuth.storeAccessToken(tokenResponse.access_token, tokenResponse.expires_in)

        setStatus('success')
        setMessage('LinkedIn authentication successful! You can now import your skills.')
        
        // Redirect back to profile page after 2 seconds
        setTimeout(() => {
          router.push('/profile')
        }, 2000)

      } catch (error) {
        console.error('LinkedIn callback error:', error)
        setStatus('error')
        setMessage('Failed to complete LinkedIn authentication')
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
            {status === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
            LinkedIn Authentication
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Processing LinkedIn authentication...'}
            {status === 'success' && 'Authentication completed successfully'}
            {status === 'error' && 'Authentication failed'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant={status === 'error' ? 'destructive' : 'default'}>
            <AlertDescription>
              {message}
            </AlertDescription>
          </Alert>
          
          {status === 'success' && (
            <p className="text-sm text-muted-foreground mt-4">
              Redirecting you back to your profile page...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
