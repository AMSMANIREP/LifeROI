import type { Metadata } from "next";
import LifeROIDashboard from "./LifeROIDashboard";

export const metadata: Metadata = {
  title: "LifeROI — Resource intelligence for your future",
  description: "Understand where your money, time, energy, and attention go—and what small changes could become.",
};

export default function Home() {
  return <LifeROIDashboard />;
}
