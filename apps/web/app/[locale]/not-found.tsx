import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page" style={{ minHeight: "50vh", display: "grid", placeItems: "center" }}>
      <div className="wrap" style={{ textAlign: "center", paddingBlock: 80 }}>
        <div className="eyebrow sec-eye" style={{ justifyContent: "center" }}>
          404
        </div>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", marginTop: 12 }}>
          Page not found
        </h1>
        <p className="muted" style={{ marginTop: 12 }}>
          The page you're looking for doesn't exist or has moved.
        </p>
        <Link className="btn btn-primary" href="/" style={{ marginTop: 24 }}>
          Go home
        </Link>
      </div>
    </div>
  );
}
