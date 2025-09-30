"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Linkedin, Download, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { linkedinAuth, LinkedInProfile } from "@/lib/linkedin-auth"
import { showToast } from "@/lib/toast"

interface LinkedInSkillsImportProps {
  candidateId: string
  onSkillsImported?: (importedCount: number) => void
}

export function LinkedInSkillsImport({ candidateId, onSkillsImported }: LinkedInSkillsImportProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [linkedinProfile, setLinkedinProfile] = useState<LinkedInProfile | null>(null)
  const [importResult, setImportResult] = useState<{ success: boolean; importedCount: number; errors: string[] } | null>(null)

  const handleLinkedInAuth = async () => {
    try {
      setIsAuthenticating(true)
      const authUrl = linkedinAuth.getAuthUrl()
      window.location.href = authUrl
    } catch (error) {
      console.error('LinkedIn auth error:', error)
      showToast.error('Failed to initiate LinkedIn authentication')
      setIsAuthenticating(false)
    }
  }

  const handleImportSkills = async () => {
    if (!linkedinProfile) return

    try {
      setIsLoading(true)
      setImportResult(null)

      // Get access token from localStorage (set during OAuth callback)
      const accessToken = linkedinAuth.getStoredAccessToken()
      if (!accessToken) {
        throw new Error('LinkedIn access token not found')
      }

      const result = await linkedinAuth.importSkillsToProfile(accessToken, candidateId)
      setImportResult(result)

      if (result.success) {
        showToast.success(`Successfully imported ${result.importedCount} skills from LinkedIn!`)
        onSkillsImported?.(result.importedCount)
      } else {
        showToast.error(`Failed to import some skills: ${result.errors.join(', ')}`)
      }
    } catch (error) {
      console.error('Import skills error:', error)
      showToast.error('Failed to import LinkedIn skills')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreviewSkills = async () => {
    try {
      setIsLoading(true)
      const accessToken = linkedinAuth.getStoredAccessToken()
      if (!accessToken) {
        throw new Error('LinkedIn access token not found')
      }

      const profile = await linkedinAuth.fetchProfileAndSkills(accessToken)
      setLinkedinProfile(profile)
    } catch (error) {
      console.error('Preview skills error:', error)
      showToast.error('Failed to fetch LinkedIn skills')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Linkedin className="h-5 w-5 text-blue-600" />
          Import Skills from LinkedIn
        </CardTitle>
        <CardDescription>
          Connect your LinkedIn account to automatically import your skills and endorsements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!linkedinProfile && !importResult && (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This will import your LinkedIn skills and mark them as verified. 
                You can review and edit them before saving.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button
                onClick={handleLinkedInAuth}
                disabled={isAuthenticating}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isAuthenticating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Linkedin className="h-4 w-4 mr-2" />
                    Connect LinkedIn
                  </>
                )}
              </Button>

              <Button
                onClick={handlePreviewSkills}
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Preview Skills
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {linkedinProfile && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {linkedinProfile.skills.length > 0 
                  ? `Found ${linkedinProfile.skills.length} skills on your LinkedIn profile`
                  : 'LinkedIn profile connected, but no skills data available. Your LinkedIn app may not have permission to access skills data.'
                }
              </AlertDescription>
            </Alert>

            <div>
              <h4 className="font-semibold mb-2">LinkedIn Skills Preview:</h4>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                {linkedinProfile.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {skill.name}
                    {skill.endorsements && (
                      <span className="text-xs text-muted-foreground">
                        ({skill.endorsements})
                      </span>
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleImportSkills}
                disabled={isLoading || linkedinProfile.skills.length === 0}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    {linkedinProfile.skills.length > 0 ? 'Import All Skills' : 'No Skills Available'}
                  </>
                )}
              </Button>

              <Button
                onClick={() => setLinkedinProfile(null)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {importResult && (
          <div className="space-y-4">
            <Alert variant={importResult.success ? "default" : "destructive"}>
              {importResult.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {importResult.success 
                  ? `Successfully imported ${importResult.importedCount} skills from LinkedIn!`
                  : `Import completed with ${importResult.errors.length} errors`
                }
              </AlertDescription>
            </Alert>

            {importResult.errors.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-600 mb-2">Errors:</h4>
                <ul className="text-sm text-red-600 space-y-1">
                  {importResult.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              onClick={() => {
                setImportResult(null)
                setLinkedinProfile(null)
              }}
              variant="outline"
              className="w-full"
            >
              Import More Skills
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
