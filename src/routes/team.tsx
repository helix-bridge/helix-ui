import { Link } from "react-router-dom";

export default function Team() {
  return (
    <>
      <span>This is Team Page</span>
      <Link to="/" className="underline">{`Home Page ->`}</Link>
    </>
  );
}
