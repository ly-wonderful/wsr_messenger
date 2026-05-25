'use client';

import { useState } from 'react';

interface NewTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTopicCreated: () => void;
}

export default function NewTopicModal({ isOpen, onClose, onTopicCreated }: NewTopicModalProps) {
  const [name, setName] = useState('');
  const [defaultMessage, setDefaultMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, default_message: defaultMessage }),
      });

      if (!res.ok) {
        throw new Error('Failed to create topic');
      }

      setName('');
      setDefaultMessage('');
      onTopicCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
        <h3 className="mb-3">Create New Topic</h3>
        {error && <div style={{ color: 'var(--color-error)', marginBottom: '1rem' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Topic Name</label>
            <input 
              type="text" 
              required 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g. Architectural Request"
            />
          </div>
          <div className="mb-4">
            <label>Default Message Template</label>
            <textarea 
              required 
              rows={4}
              value={defaultMessage} 
              onChange={e => setDefaultMessage(e.target.value)}
              placeholder="Dear Board..."
            />
          </div>
          <div className="flex gap-2 justify-between">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Topic'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
