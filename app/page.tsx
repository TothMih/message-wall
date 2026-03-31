'use client';

import { useEffect, useMemo, useState } from 'react';

type MessageItem = {
  id: number;
  content: string;
  created_at: string;
};

export default function HomePage() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isSaveDisabled = useMemo(() => {
    return saving || content.trim().length === 0;
  }, [content, saving]);

  async function loadMessages(): Promise<void> {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/messages', {
        method: 'GET',
        cache: 'no-store'
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(result?.error || 'Nem sikerült betölteni az adatokat.');
      }

      const result = (await response.json()) as MessageItem[];
      setMessages(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ismeretlen hiba történt.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setError('Az üzenet nem lehet üres.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: trimmedContent
        })
      });

      const result = (await response.json().catch(() => null)) as
        | MessageItem
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          result && 'error' in result && result.error
            ? result.error
            : 'Nem sikerült menteni az üzenetet.'
        );
      }

      if (result && 'id' in result) {
        setMessages((previous) => [result, ...previous]);
      }

      setContent('');
      setSuccess('Az üzenet sikeresen elmentve.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ismeretlen hiba történt.';
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number): Promise<void> {
    setDeletingId(id);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/messages/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(result?.error || 'Nem sikerült törölni az üzenetet.');
      }

      setMessages((previous) => previous.filter((message) => message.id !== id));
      setSuccess('Az üzenet törölve lett.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ismeretlen hiba történt.';
      setError(message);
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    void loadMessages();
  }, []);

  return (
    <main className="page">
      <section className="card">
        <h1 className="title">Üzenőfal</h1>
        <p className="subtitle">
          Írj be egy üzenetet, mentsd el, és az összes bejegyzés megjelenik fordított időrendben.
        </p>

        {error ? <div className="error">{error}</div> : null}
        {success ? <div className="success">{success}</div> : null}

        <form className="form" onSubmit={handleSubmit}>
          <textarea
            className="textarea"
            placeholder="Ide írd az üzenetet..."
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
          <button className="primary-button" type="submit" disabled={isSaveDisabled}>
            {saving ? 'Mentés...' : 'Mentés'}
          </button>
        </form>

        <div className="list">
          {loading ? <div className="empty">Betöltés...</div> : null}

          {!loading && messages.length === 0 ? (
            <div className="empty">Még nincs egyetlen bejegyzés sem.</div>
          ) : null}

          {!loading &&
            messages.map((message) => (
              <article className="message-item" key={message.id}>
                <div className="message-content">
                  <p className="message-text">{message.content}</p>
                  <div className="message-date">
                    {new Date(message.created_at).toLocaleString('hu-HU')}
                  </div>
                </div>

                <button
                  className="delete-button"
                  type="button"
                  onClick={() => void handleDelete(message.id)}
                  disabled={deletingId === message.id}
                >
                  {deletingId === message.id ? 'Törlés...' : 'Törlés'}
                </button>
              </article>
            ))}
        </div>
      </section>
    </main>
  );
}