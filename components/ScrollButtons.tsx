"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { ReactElement } from 'react';

interface ScrollButtonsProps {
  onContact?: () => void;
  slug: string;
}

export default function ScrollButtons({
  onContact,
  slug,
}: ScrollButtonsProps): ReactElement | null {
  const [visible, setVisible] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [footerOffset, setFooterOffset] = useState(0);

  useEffect(() => {
    const hero = document.querySelector(
      '.landing-hero, .gallery-hero',
    ) as HTMLElement | null;
    const footer = document.querySelector('.site-footer') as HTMLElement | null;

    if (!hero) {
      return;
    }
    setEnabled(true);

    const updateSafeSpace = (offset: number) => {
      const BASE_SAFE_SPACE = 72; // matches ~4.5rem button height allowance
      const safeSpace = Math.max(BASE_SAFE_SPACE - offset, 0);
      document.body.style.setProperty(
        '--scroll-buttons-safe-space',
        `${safeSpace.toFixed(2)}px`,
      );
    };

    const onScroll = () => {
      const rect = hero.getBoundingClientRect();
      setVisible(rect.bottom <= 0);

      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const overlap = Math.max(0, window.innerHeight - footerRect.top);
        const desiredOffset = overlap > 0 ? overlap + 16 : 0;

        updateSafeSpace(desiredOffset);
        setFooterOffset((current) =>
          Math.abs(current - desiredOffset) > 0.5 ? desiredOffset : current,
        );
      }
    };

    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onScroll);
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      document.body.style.removeProperty('--scroll-buttons-safe-space');
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    document.body.classList.add('has-scroll-buttons');
    if (!document.body.style.getPropertyValue('--scroll-buttons-safe-space')) {
      document.body.style.setProperty('--scroll-buttons-safe-space', '72px');
    }
    return () => document.body.classList.remove('has-scroll-buttons');
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  return (
    <div
      className={`scroll-buttons${visible ? ' visible' : ''}`}
      style={{ bottom: `${footerOffset}px` }}
    >
      <span className="price">$315/night</span>
      <div className="actions">
        <Link href={`/properties/${slug}/book`} className="btn">
          Book
        </Link>
        <button className="btn outline" onClick={onContact}>
          Contact
        </button>
      </div>
    </div>
  );
}