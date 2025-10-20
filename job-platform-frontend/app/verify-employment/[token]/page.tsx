'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { getApiUrl } from '@/lib/config'
import { toast } from 'sonner'

export default function VerifyEmploymentPage() {
  const params = useParams<{ token: string }>()
  const router = useRouter()
  const token = params?.token

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [record, setRecord] = useState<any>(null)
  const [verified, setVerified] = useState<'yes'|'no'|'undecided'>('undecided')
  const [comments, setComments] = useState('')
  const [correctedTitle, setCorrectedTitle] = useState('')
  const [correctedStart, setCorrectedStart] = useState('')
  const [correctedEnd, setCorrectedEnd] = useState('')
  const [correctedResp, setCorrectedResp] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!token) return
      try {
        const res = await fetch(getApiUrl(`/verified-employment/review/${token}`))
        const data = await res.json()
        if (!res.ok) {
          toast.error(data.error || 'Invalid or expired link')
          router.replace('/')
          return
        }
        setRecord(data.data)
        setCorrectedTitle(data.data?.title || '')
        setCorrectedStart(data.data?.start_date || '')
        setCorrectedEnd(data.data?.end_date || '')
      } catch (e:any) {
        toast.error(e.message || 'Failed to load review')
        router.replace('/')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token, router])

  const submit = async () => {
    if (verified === 'undecided') {
      toast.error('Please select Verify or Decline')
      return
    }
    try {
      setSubmitting(true)
      const res = await fetch(getApiUrl(`/verified-employment/review/${token}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verified: verified === 'yes',
          comments,
          corrected_title: correctedTitle || undefined,
          corrected_start_date: correctedStart || undefined,
          corrected_end_date: correctedEnd || undefined,
          corrected_responsibilities: correctedResp || undefined,
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit review')
      toast.success('Thank you. Your response has been recorded.')
      router.replace('/reference/thank-you')
    } catch (e:any) {
      toast.error(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!record) return null

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Employment Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground">Candidate:</p>
            <div className="flex items-center gap-2">
              <Badge>{record.title}</Badge>
              <span className="font-medium">{record.company_name}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Dates: {record.start_date} - {record.end_date || 'Present'}</p>
          </div>

          <div>
            <Label>Relationship</Label>
            <p className="text-sm text-muted-foreground">Manager/HR/Colleague</p>
          </div>

          <div>
            <Label>Confirm employment</Label>
            <RadioGroup value={verified} onValueChange={(v:any)=>setVerified(v)} className="mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="yes" />
                <Label htmlFor="yes">Verify</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="no" />
                <Label htmlFor="no">Decline</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Corrected Title</Label>
              <Input id="title" value={correctedTitle} onChange={e=>setCorrectedTitle(e.target.value)} />
            </div>
            <div></div>
            <div>
              <Label htmlFor="start">Corrected Start Date</Label>
              <Input id="start" type="date" value={correctedStart} onChange={e=>setCorrectedStart(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="end">Corrected End Date</Label>
              <Input id="end" type="date" value={correctedEnd} onChange={e=>setCorrectedEnd(e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="resp">Responsibilities (optional correction)</Label>
            <Textarea id="resp" value={correctedResp} onChange={e=>setCorrectedResp(e.target.value)} rows={4} />
          </div>

          <div>
            <Label htmlFor="comments">Comments</Label>
            <Textarea id="comments" value={comments} onChange={e=>setComments(e.target.value)} rows={4} placeholder="Optional notes about this verification" />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={()=>router.replace('/')}>Cancel</Button>
            <Button onClick={submit} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


