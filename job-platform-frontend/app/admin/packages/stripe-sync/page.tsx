'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { showToast } from '@/lib/toast';
import AuthGuard from '@/components/auth/auth-guard';

interface StripeProduct {
  id: string;
  name: string;
  description: string;
  active: boolean;
  metadata: {
    features?: string;
    max_job_postings?: string;
    max_applications?: string;
    max_team_members?: string;
  };
}

export default function StripeSyncPage() {
  const { user } = useAuth();
  const [stripeProducts, setStripeProducts] = useState<StripeProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    fetchStripeProducts();
  }, []);

  const fetchStripeProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/stripe/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Stripe products');
      }

      const data = await response.json();
      setStripeProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching Stripe products:', error);
      showToast.error('Failed to fetch Stripe products');
    } finally {
      setLoading(false);
    }
  };

  const syncFromStripe = async (productId: string) => {
    try {
      setSyncing(productId);
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/stripe/sync-from-stripe/${productId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to sync from Stripe');
      }

      const data = await response.json();
      showToast.success(data.message || 'Package synced from Stripe successfully');
    } catch (error) {
      console.error('Error syncing from Stripe:', error);
      showToast.error('Failed to sync from Stripe');
    } finally {
      setSyncing(null);
    }
  };

  const syncAllFromStripe = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/stripe/sync-all-from-stripe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to sync all from Stripe');
      }

      const data = await response.json();
      showToast.success(data.message || 'All packages synced from Stripe successfully');
    } catch (error) {
      console.error('Error syncing all from Stripe:', error);
      showToast.error('Failed to sync all from Stripe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard allowedRoles={['super_admin']}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Stripe Sync Management</h1>
            <p className="mt-2 text-gray-600">
              Manage bidirectional sync between your website and Stripe
            </p>
          </div>

          {/* Sync All Button */}
          <div className="mb-8">
            <button
              onClick={syncAllFromStripe}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Syncing...' : 'Sync All Packages from Stripe'}
            </button>
          </div>

          {/* Stripe Products List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Stripe Products</h2>
              <p className="text-sm text-gray-500">
                Products from your Stripe account that can be synced to your website
              </p>
            </div>

            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading Stripe products...</p>
              </div>
            ) : stripeProducts.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">No Stripe products found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {stripeProducts.map((product) => (
                  <div key={product.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {product.description}
                        </p>
                        <div className="mt-2 flex items-center space-x-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.active ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-xs text-gray-500">
                            ID: {product.id}
                          </span>
                        </div>
                        {product.metadata && (
                          <div className="mt-2 text-xs text-gray-500">
                            <p>Features: {product.metadata.features || 'None'}</p>
                            <p>Limits: {product.metadata.max_job_postings || 0} jobs, {product.metadata.max_applications || 0} applications, {product.metadata.max_team_members || 0} team members</p>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => syncFromStripe(product.id)}
                          disabled={syncing === product.id}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          {syncing === product.id ? 'Syncing...' : 'Sync to Website'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sync Information */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">How Stripe Sync Works</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p><strong>Stripe → Website:</strong> When you create/update packages in Stripe, they automatically sync to your website via webhooks.</p>
              <p><strong>Website → Stripe:</strong> When you create/update packages on your website, they automatically sync to Stripe.</p>
              <p><strong>Deletion:</strong> When packages are deleted from Stripe, they are marked as inactive on your website.</p>
              <p><strong>Archiving:</strong> When packages are archived in Stripe, they are marked as inactive and hidden from pricing pages.</p>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
