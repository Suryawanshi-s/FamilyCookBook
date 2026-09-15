import { useEffect, useState } from "react";
import { PublicCookbook } from "./views/PublicCookbook";
import { Builder } from "./views/Builder";

function currentRoute(): string {
  return window.location.hash.replace(/^#\/?/, "").toLowerCase();
}

export default function App() {
  const [route, setRoute] = useState<string>(currentRoute());

  useEffect(() => {
    const onHash = () => setRoute(currentRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return route === "jojobean" ? <Builder /> : <PublicCookbook />;
}
