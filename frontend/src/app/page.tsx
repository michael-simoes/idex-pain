type OverlayNode = {
  id: string;
  x: number;
  y: number;
};

type OverlayEdge = {
  from: string;
  to: string;
};

const nodes: OverlayNode[] = [
  { id: 'A', x: 250, y: 220 },
  { id: 'B', x: 420, y: 250 },
  { id: 'C', x: 540, y: 310 },
  { id: 'D', x: 360, y: 400 },
];

const edges: OverlayEdge[] = [
  { from: 'A', to: 'B' },
  { from: 'B', to: 'C' },
  { from: 'B', to: 'D' },
];

export default function Home() {
  const getNode = (id: string) => nodes.find((n) => n.id === id);

  return (
    <main>
      <h1>Welcome to the POC</h1>
      <p>This is a super-simple unstyled landing page served by Next.js.</p>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <img
          src="/Screenshot 2025-09-17 154200.png"
          alt="Base map"
          style={{ display: 'block', width: '100%', height: 'auto', maxWidth: 800 }}
        />
        {/* SVG overlay with simple nodes and edges */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          viewBox="0 0 821 611"
          preserveAspectRatio="xMidYMid meet"
        >
          <g stroke="#ff3b3b" strokeWidth={3} fill="none">
            {edges.map((e, idx) => {
              const a = getNode(e.from);
              const b = getNode(e.to);
              if (!a || !b) return null;
              return <line key={`edge-${idx}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
            })}
          </g>
          <g>
            {nodes.map((n) => (
              <circle key={n.id} cx={n.x} cy={n.y} r={6} fill="#1877f2" stroke="#ffffff" strokeWidth={2} />
            ))}
          </g>
        </svg>
      </div>
    </main>
  );
}
