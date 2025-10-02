import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <span className="site-footer__copy">© {new Date().getFullYear()} Stroman Properties</span>
        <nav aria-label="Footer">
          <Link href="/admin" className="site-footer__admin-link">
            Admin
          </Link>
        </nav>
      </div>
    </footer>
  );
}
