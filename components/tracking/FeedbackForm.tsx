'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { addDeliveryFeedback } from '@/lib/firestore';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

interface FeedbackFormProps {
  deliveryId: string;
  onSubmit?: () => void;
}

export function FeedbackForm({ deliveryId, onSubmit }: FeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setLoading(true);
    try {
      await addDeliveryFeedback(deliveryId, {
        rating,
        comment,
        givenBy: 'customer'
      });
      
      setSubmitted(true);
      toast.success('Thank you for your feedback!');
      onSubmit?.();
    } catch (error) {
      toast.error('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-green-600 mb-2">
            <Star className="h-8 w-8 mx-auto fill-current" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Thank You!</h3>
          <p className="text-muted-foreground">Your feedback has been submitted.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Your Delivery Experience</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-1 rounded ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  <Star className="h-6 w-6 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium mb-2">
              Comments (Optional)
            </label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your delivery experience..."
              rows={3}
            />
          </div>

          <Button type="submit" disabled={loading || rating === 0} className="w-full">
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}