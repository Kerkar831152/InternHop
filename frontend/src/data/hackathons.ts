import type { Hackathon } from "../types/hackathons";

export const hackathons: Hackathon[] = [
  {
    id: 1,
    title: "Build for India",
    organizer: "TechForge",
    location: "Online",
    eventType: "Online",
    skills: ["React", "Node.js", "AI"],
    prize: "₹1,00,000",
    deadline: "12 Oct 2026",
  },
  {
    id: 2,
    title: "Goa Innovation Hack",
    organizer: "Goa Tech Community",
    location: "Goa",
    eventType: "Offline",
    skills: ["Python", "Django", "AI"],
    prize: "₹75,000",
    deadline: "18 Oct 2026",
  },
  {
    id: 3,
    title: "CodeSprint 2026",
    organizer: "DevLeague",
    location: "Bangalore",
    eventType: "Hybrid",
    skills: ["JavaScript", "Cloud", "MongoDB"],
    prize: "₹1,50,000",
    deadline: "22 Oct 2026",
  },
  {
    id: 4,
    title: "AI for Good",
    organizer: "FutureLabs",
    location: "Online",
    eventType: "Online",
    skills: ["Python", "Machine Learning", "OpenCV"],
    prize: "₹2,00,000",
    deadline: "28 Oct 2026",
  },
];