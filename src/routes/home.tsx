import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <span>This is Home Page</span>
      <Link to="/team" className="underline">{`Team Page ->`}</Link>
    </>
  );
}
