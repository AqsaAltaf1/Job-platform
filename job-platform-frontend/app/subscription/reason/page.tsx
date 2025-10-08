'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SubscriptionReasonPage() {
  const router = useRouter();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate processing
    setTimeout(() => {
      setSubmitting(false);
      alert('Thank you for your feedback! Your subscription has been processed.');
      router.push('/subscription/success');
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Reason</CardTitle>
            <CardDescription>
              Please provide a reason for your subscription to help us improve our service.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Subscription</Label>
                <Textarea
                  id="reason"
                  placeholder="Tell us why you're subscribing to our service..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={submitting}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !reason.trim()}
                  className="flex-1"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? 'Processing...' : 'Submit Reason'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
