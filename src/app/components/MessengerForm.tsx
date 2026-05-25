'use client';

import { useState, useEffect } from 'react';
import NewTopicModal from './NewTopicModal';

type Topic = {
  id: number;
  name: string;
  default_message: string;
  sent_count: number;
};

export default function MessengerForm() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const fetchTopics = async () => {
    try {
      const res = await fetch('/api/topics');
      const data = await res.json();
      if (data.topics) {
        setTopics(data.topics);
      }
    } catch (err) {
      console.error('Failed to fetch topics', err);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  // Update message textarea when topic changes
  useEffect(() => {
    if (selectedTopicId) {
      const topic = topics.find(t => t.id.toString() === selectedTopicId);
      if (topic && !message) {
        setMessage(topic.default_message);
      } else if (topic && message) {
        // Only override if the user explicitly changes topic to get the new template
        setMessage(topic.default_message);
      }
    } else {
      setMessage('');
    }
  }, [selectedTopicId, topics]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName, lastName, email, phone, address,
          topicId: Number(selectedTopicId), message
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to send');

      setStatusMsg({ type: 'success', text: 'Your message has been sent successfully to the HOA Board!' });
      
      // Reset form but keep contact info
      setMessage('');
      setSelectedTopicId('');
      
      // Refresh topics to update sent counts
      fetchTopics();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'An error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card" style={{ marginTop: '2rem' }}>
      <h2 className="mb-4 text-center">Contact HOA Board</h2>
      
      {statusMsg.text && (
        <div style={{ 
          padding: '1rem', marginBottom: '1.5rem', borderRadius: '8px',
          backgroundColor: statusMsg.type === 'success' ? '#d4edda' : '#f8d7da',
          color: statusMsg.type === 'success' ? '#155724' : '#721c24'
        }}>
          {statusMsg.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <label>First Name *</label>
            <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} />
          </div>
          <div>
            <label>Last Name *</label>
            <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <label>Email Address *</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label>Phone Number</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
        </div>

        <div className="mb-4">
          <label>Home Address *</label>
          <input type="text" required value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Windsong Way" />
        </div>

        <hr style={{ margin: '2rem 0', borderColor: 'var(--color-border)', opacity: 0.5 }} />

        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <label style={{ margin: 0 }}>Select a Topic *</label>
            <button type="button" onClick={() => setIsModalOpen(true)} style={{ 
              background: 'none', border: 'none', color: 'var(--color-primary)', 
              cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' 
            }}>
              + Create New Topic
            </button>
          </div>
          <select required value={selectedTopicId} onChange={e => setSelectedTopicId(e.target.value)}>
            <option value="" disabled>-- Choose a topic --</option>
            {topics.map(t => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.sent_count} {t.sent_count === 1 ? 'email' : 'emails'} sent)
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label>Message *</label>
          <textarea 
            required 
            rows={6} 
            value={message} 
            onChange={e => setMessage(e.target.value)}
            placeholder="Select a topic to populate a template, or type your message here..."
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSubmitting || !selectedTopicId}>
          {isSubmitting ? 'Sending...' : 'Send Message to Board Members'}
        </button>
      </form>

      <NewTopicModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onTopicCreated={fetchTopics} 
      />
    </div>
  );
}
