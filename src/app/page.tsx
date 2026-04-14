import Link from "next/link";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <>
      {/* Navigation */}
      <nav className={`glass-nav ${styles.nav}`}>
        <div className={`container container--wide ${styles.navContainer}`}>
          <Link href="/" className={styles.brand}>
            <span className={styles.brandIcon}>📱</span>
            <span className={styles.brandName}>SmartMenu</span>
          </Link>
          <div className={styles.navLinks}>
            <Link href="/login" className="btn btn-ghost btn-sm">
              Log In
            </Link>
            <Link href="/signup" className="btn btn-primary btn-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={`container ${styles.heroContent}`}>
            <div className={styles.heroBadge}>
              <span>✨</span> Free for restaurants
            </div>
            <h1 className={styles.heroTitle}>
              Your Menu,
              <br />
              <span className={styles.heroAccent}>Digitally Delicious</span>
            </h1>
            <p className={styles.heroDescription}>
              Transform your restaurant menu into a stunning digital experience.
              Customers scan a QR code, browse your menu, and decide what to eat
              — no app download, no friction.
            </p>
            <div className={styles.heroCTA}>
              <Link href="/signup" className="btn btn-primary">
                Create Your Menu — Free
              </Link>
              <Link href="/menu/spice-garden" className="btn btn-secondary">
                See Demo Menu →
              </Link>
            </div>
          </div>

          {/* Floating food emojis */}
          <div className={styles.floatingElements} aria-hidden="true">
            <span className={styles.float1}>🍛</span>
            <span className={styles.float2}>🍗</span>
            <span className={styles.float3}>🥗</span>
            <span className={styles.float4}>🍮</span>
          </div>
        </section>

        {/* How It Works Section */}
        <section className={styles.howItWorks}>
          <div className="container container--wide">
            <h2 className={`heading-2 ${styles.sectionTitle}`}>
              How It Works
            </h2>
            <p className={`text-muted ${styles.sectionSubtitle}`}>
              Three simple steps from QR code to happy customer
            </p>

            <div className={styles.stepsGrid}>
              <div className={`glass-card ${styles.step}`}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepIcon}>📱</div>
                <h3 className="heading-4">Scan</h3>
                <p className="text-sm text-muted">
                  Customer scans the QR code on their table. Menu opens instantly
                  in their phone browser.
                </p>
              </div>

              <div className={`glass-card ${styles.step}`}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepIcon}>🍽️</div>
                <h3 className="heading-4">Browse</h3>
                <p className="text-sm text-muted">
                  Beautiful food photos, dietary filters, and descriptions help
                  them choose confidently.
                </p>
              </div>

              <div className={`glass-card ${styles.step}`}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepIcon}>✅</div>
                <h3 className="heading-4">Decide</h3>
                <p className="text-sm text-muted">
                  They make their choice and tell the server. No confusion, no
                  back-and-forth.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.features}>
          <div className="container container--wide">
            <h2 className={`heading-2 ${styles.sectionTitle}`}>
              Built for Indian Restaurants
            </h2>
            <p className={`text-muted ${styles.sectionSubtitle}`}>
              Every feature designed for how Indian restaurants actually work
            </p>

            <div className={styles.featuresGrid}>
              {[
                {
                  icon: "🌿",
                  title: "Veg/Non-Veg Indicators",
                  desc: "Clear green and red dots on every item. Your customers know at a glance.",
                },
                {
                  icon: "🌶️",
                  title: "Spice Level Indicators",
                  desc: "1 to 5 chili scale so customers can pick what suits their taste.",
                },
                {
                  icon: "💰",
                  title: "INR Pricing",
                  desc: "Prices in ₹, formatted beautifully. Discounts and original prices shown clearly.",
                },
                {
                  icon: "📸",
                  title: "Food Photography",
                  desc: "Upload photos from your phone. We auto-optimize them to load fast on 4G.",
                },
                {
                  icon: "⚡",
                  title: "Real-Time Updates",
                  desc: "Mark an item as sold out from your dashboard. It shows instantly on the menu.",
                },
                {
                  icon: "🖨️",
                  title: "Print-Ready QR Codes",
                  desc: "Download high-resolution QR codes. Print on table tents, posters, or cards.",
                },
              ].map((feature) => (
                <div key={feature.title} className={`glass-card ${styles.featureCard}`}>
                  <span className={styles.featureIcon}>{feature.icon}</span>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className="text-sm text-muted">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className="container" style={{ textAlign: "center" }}>
            <h2 className="heading-2" style={{ marginBottom: "var(--space-3)" }}>
              Ready to Go Digital?
            </h2>
            <p
              className="text-muted"
              style={{ marginBottom: "var(--space-6)", maxWidth: "400px", margin: "0 auto var(--space-6)" }}
            >
              Set up your digital menu in under 10 minutes. No technical knowledge
              required. Free forever for basic use.
            </p>
            <Link href="/signup" className="btn btn-primary">
              Create Your Menu — It&apos;s Free
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={`container container--wide ${styles.footerContent}`}>
            <div className={styles.footerBrand}>
              <span className={styles.brandIcon}>📱</span>
              <span className={styles.brandName}>SmartMenu</span>
            </div>
            <p className="text-xs text-muted">
              © {new Date().getFullYear()} SmartMenu. Built for Indian restaurants.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
