"use client";

import HomePage from "./home-page";
import ProjectPage from "./project-page";

const isHomePage = !window.location.hostname.split(".").includes("darwinia");

export default function PageSelect() {
  return isHomePage ? <HomePage /> : <ProjectPage />;
}
