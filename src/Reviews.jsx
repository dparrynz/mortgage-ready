import React from 'react';
import { C, useWindowWidth } from '../ParryFSApp.jsx';

// Real Google reviews, quoted as written. Names shortened to first name and
// last initial. No link to the Google profile (it carries other branding).
export const REVIEWS = [
  { name: 'Paris C.', stars: 5, text: 'Dan was incredibly thorough throughout my first home-buying journey. His communication was excellent, and he Dan made the whole experience feel smooth and manageable. I really appreciated his professionalism, knowledge, and genuine support, and would highly recommend him to anyone looking for a mortgage adviser.' },
  { name: 'Gin R.', stars: 5, text: 'Absolutely fabulous experience with Dan. Bought my first home by myself without any stress and felt like I was supported through every step.' },
  { name: 'Michael R.', stars: 5, text: 'It was an absolute pleasure dealing with Dan Dan the broker man. From start to finish he made this a very stress-free process. Highly recommend to anyone in need of a quality broker.' },
  { name: 'Daniel W.', stars: 5, text: 'Dan was very helpful and a general joy to work with while we navigating buying our first home. Would definitely recommend!' },
];

function Stars({ count }) {
  return (
    <div role="img" aria-label={`${count} out of 5 stars`} style={{ display: 'flex', gap: '2px', marginBottom: '12px' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill={i < count ? '#F5A623' : '#E2EAF7'}>
          <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
        </svg>
      ))}
    </div>
  );
}

export default function Reviews({ title = 'What our clients say', compact = false }) {
  const isMobile = useWindowWidth() < 768;
  return (
    <div>
      {title && <h2 style={{ margin: '0 0 22px', fontFamily: C.headingFont, fontSize: compact ? '20px' : isMobile ? '24px' : '32px', fontWeight: 700, color: C.navy }}>{title}</h2>}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile || compact ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: compact ? '12px' : '16px' }}>
        {REVIEWS.map((r) => (
          <figure key={r.name} style={{ margin: 0, background: compact ? C.inputBg : '#FFFFFF', border: compact ? 'none' : `1px solid ${C.borderLight}`, borderRadius: '18px', padding: compact ? '1.1rem 1.25rem' : '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <Stars count={r.stars} />
            <blockquote style={{ margin: '0 0 14px', fontSize: compact ? '14px' : '16px', lineHeight: 1.65, color: '#33415C', flex: 1 }}>"{r.text}"</blockquote>
            <figcaption style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <span style={{ fontWeight: 600, color: C.navy }}>{r.name}</span>
              <span style={{ fontSize: '12px', color: C.textSecondary }}>Google review</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
