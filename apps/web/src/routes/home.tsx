import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="app-main">
      <p>Hi, I'm home page!</p>
      <Link to="/transfer">Transfer</Link>
    </main>
  );
}
