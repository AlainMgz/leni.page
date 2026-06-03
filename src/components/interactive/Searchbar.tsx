import { useState, useEffect, useRef, useCallback } from 'react';

interface Post {
  slug: string;
  title: string;
  tags: string[];
  severity?: string;
}

interface Page {
  label: string;
  href: string;
  icon: string;
}

interface Props {
  posts: Post[];
}

const PAGES: Page[] = [
  { label: 'Home', href: '/', icon: '⌂' },
  { label: 'Posts', href: '/posts', icon: '≡' },
  { label: 'Contact', href: '/contact', icon: '✉' },
];

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  );
}

function fuzzy(query: string, target: string): boolean {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

function severityIcon(severity?: string): string {
  switch (severity) {
    case 'critical': return '!';
    case 'high': return '↑';
    case 'medium': return '~';
    default: return '◈';
  }
}

export default function Searchbar({ posts }: Props) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredPages = query
    ? PAGES.filter(p => fuzzy(query, p.label) || fuzzy(query, p.href))
    : PAGES;

  const filteredPosts = posts.filter(p =>
    !query ||
    fuzzy(query, p.title) ||
    p.tags.some(t => fuzzy(query, t)) ||
    (p.severity && fuzzy(query, p.severity))
  );

  const allResults = [
    ...filteredPages.map(p => ({ type: 'page' as const, ...p })),
    ...filteredPosts.map(p => ({
      type: 'post' as const,
      label: p.title,
      href: `/posts/${p.slug}`,
      icon: severityIcon(p.severity),
      tags: p.tags,
      severity: p.severity,
    })),
  ];

  const navigate = useCallback((href: string) => {
    setVisible(false);
    setTimeout(() => { setOpen(false); window.location.href = href; }, 180);
  }, []);

  useEffect(() => { setActiveIndex(0); }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (open) {
          setVisible(false);
          setTimeout(() => { setOpen(false); setQuery(''); }, 180);
        } else {
          setOpen(true);
          setQuery('');
          requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
        }
      }
      if (e.key === 'Escape' && open) {
        setVisible(false);
        setTimeout(() => { setOpen(false); setQuery(''); }, 180);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, allResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      const result = allResults[activeIndex];
      if (result) navigate(result.href);
    }
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => { setOpen(false); setQuery(''); }, 180);
  };

  if (!open) return null;

  const pageResults = allResults.filter(r => r.type === 'page');
  const postResults = allResults.filter(r => r.type === 'post');
  let idx = 0;

  return (
    <>
      <style>{`
        @keyframes searchbar-drop {
          from { opacity: 0; transform: translateY(-12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes searchbar-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .searchbar-overlay {
          opacity: 0;
          transition: opacity 0.18s ease;
        }
        .searchbar-overlay.visible {
          opacity: 1;
          animation: searchbar-fade 0.18s ease forwards;
        }
        .searchbar-panel {
          opacity: 0;
          transform: translateY(-12px) scale(0.97);
          transition: opacity 0.18s ease, transform 0.18s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .searchbar-panel.visible {
          animation: searchbar-drop 0.22s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>

      <div
        className={`searchbar-overlay${visible ? ' visible' : ''}`}
        style={styles.overlay}
        onClick={handleClose}
      >
        <div
          className={`searchbar-panel${visible ? ' visible' : ''}`}
          style={styles.panel}
          onClick={e => e.stopPropagation()}
          onKeyDown={handleKeyDown}
        >
          <div style={styles.searchRow}>
            <span style={styles.searchIcon}><SearchIcon /></span>
            <input
              ref={inputRef}
              style={styles.input}
              placeholder="search posts, pages…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <kbd style={styles.kbd}>esc</kbd>
          </div>

          <div style={styles.results}>
            {pageResults.length > 0 && (
              <>
                <div style={styles.groupLabel}>Pages</div>
                {pageResults.map(result => {
                  const i = idx++;
                  const active = i === activeIndex;
                  return (
                    <div
                      key={result.href}
                      style={{ ...styles.resultItem, ...(active ? styles.resultItemActive : {}) }}
                      onClick={() => navigate(result.href)}
                      onMouseEnter={() => setActiveIndex(i)}
                    >
                      <div style={{ ...styles.resultIcon, ...styles.resultIconPage }}>
                        {result.icon}
                      </div>
                      <div style={styles.resultText}>
                        <div style={{ ...styles.resultTitle, ...(active ? styles.resultTitleActive : {}) }}>
                          {result.label}
                        </div>
                        <div style={styles.resultSub}>{result.href}</div>
                      </div>
                      <span style={{ ...styles.resultArrow, ...(active ? styles.resultArrowActive : {}) }}>↵</span>
                    </div>
                  );
                })}
              </>
            )}

            {postResults.length > 0 && (
              <>
                <div style={styles.groupLabel}>Posts</div>
                {postResults.map(result => {
                  const i = idx++;
                  const active = i === activeIndex;
                  const isCritical = result.severity === 'critical' || result.severity === 'high';
                  return (
                    <div
                      key={result.href}
                      style={{ ...styles.resultItem, ...(active ? styles.resultItemActive : {}) }}
                      onClick={() => navigate(result.href)}
                      onMouseEnter={() => setActiveIndex(i)}
                    >
                      <div style={{ ...styles.resultIcon, ...(isCritical ? styles.resultIconCritical : styles.resultIconPost) }}>
                        {result.icon}
                      </div>
                      <div style={styles.resultText}>
                        <div style={{ ...styles.resultTitle, ...(active ? styles.resultTitleActive : {}) }}>
                          {result.label}
                        </div>
                        {'tags' in result && result.tags?.length > 0 && (
                          <div style={styles.tagRow}>
                            {result.tags.slice(0, 3).map((tag: string) => (
                              <span key={tag} style={styles.tag}>{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span style={{ ...styles.resultArrow, ...(active ? styles.resultArrowActive : {}) }}>↵</span>
                    </div>
                  );
                })}
              </>
            )}

            {allResults.length === 0 && (
              <div style={styles.empty}>no results for "{query}"</div>
            )}
          </div>

          <div style={styles.footer}>
            <span style={styles.footerHint}><kbd style={styles.kbdSmall}>↑↓</kbd> navigate</span>
            <span style={styles.footerHint}><kbd style={styles.kbdSmall}>↵</kbd> open</span>
            <span style={styles.footerHint}><kbd style={styles.kbdSmall}>esc</kbd> close</span>
          </div>
        </div>
      </div>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: '12vh',
  },
  panel: {
    width: '100%',
    maxWidth: '540px',
    margin: '0 1rem',
    background: 'rgba(18,18,30,0.92)',
    border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    overflow: 'hidden',
    backdropFilter: 'blur(32px)',
    WebkitBackdropFilter: 'blur(32px)',
    boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
  },
  searchRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 16px',
    borderBottom: '0.5px solid rgba(255,255,255,0.07)',
  },
  searchIcon: {
    fontSize: '20px',
    color: 'rgba(255,255,255,0.35)',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    background: 'none',
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    fontFamily: 'inherit',
    color: 'rgba(255,255,255,0.85)',
    caretColor: 'rgba(139,92,246,0.9)',
  },
  kbd: {
    fontSize: '10px',
    fontWeight: 500,
    color: 'rgba(255,255,255,0.4)',
    background: 'rgba(255,255,255,0.05)',
    border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: '4px',
    padding: '2px 6px',
    flexShrink: 0,
    fontFamily: 'inherit',
  },
  kbdSmall: {
    fontSize: '10px',
    fontWeight: 500,
    color: 'rgba(255,255,255,0.4)',
    background: 'rgba(255,255,255,0.05)',
    border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: '4px',
    padding: '1px 4px',
    fontFamily: 'inherit',
  },
  results: {
    padding: '8px 0',
    maxHeight: '360px',
    overflowY: 'auto',
  },
  groupLabel: {
    fontSize: '9px',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.18)',
    padding: '8px 16px 4px',
  },
  resultItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '9px 16px',
    cursor: 'pointer',
  },
  resultItemActive: {
    background: 'rgba(139,92,246,0.12)',
  },
  resultIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '7px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    flexShrink: 0,
  },
  resultIconPage: {
    background: 'rgba(99,102,241,0.15)',
    color: 'rgba(165,180,252,0.8)',
    border: '0.5px solid rgba(99,102,241,0.2)',
  },
  resultIconPost: {
    background: 'rgba(255,255,255,0.04)',
    color: 'rgba(255,255,255,0.3)',
    border: '0.5px solid rgba(255,255,255,0.08)',
  },
  resultIconCritical: {
    background: 'rgba(239,68,68,0.1)',
    color: 'rgba(252,165,165,0.8)',
    border: '0.5px solid rgba(239,68,68,0.2)',
  },
  resultText: {
    flex: 1,
    minWidth: 0,
  },
  resultTitle: {
    fontSize: '12px',
    fontWeight: 500,
    color: 'rgba(255,255,255,0.7)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  resultTitleActive: {
    color: 'rgba(255,255,255,0.95)',
  },
  resultSub: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.25)',
    marginTop: '1px',
  },
  tagRow: {
    display: 'flex',
    gap: '4px',
    marginTop: '3px',
  },
  tag: {
    fontSize: '8px',
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    padding: '1px 5px',
    borderRadius: '3px',
    background: 'rgba(99,102,241,0.1)',
    color: 'rgba(165,180,252,0.7)',
    border: '0.5px solid rgba(99,102,241,0.2)',
  },
  resultArrow: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.12)',
    flexShrink: 0,
  },
  resultArrowActive: {
    color: 'rgba(167,139,250,0.9)',
  },
  empty: {
    padding: '24px 16px',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.2)',
    textAlign: 'center',
    fontFamily: 'ui-monospace, monospace',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '8px 16px',
    borderTop: '0.5px solid rgba(255,255,255,0.06)',
  },
  footerHint: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '10px',
    color: 'rgba(255,255,255,0.4)',
  },
};