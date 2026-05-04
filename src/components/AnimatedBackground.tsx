// src/components/AnimatedBackground.tsx
import React from "react";
import { useTheme } from "../context/ThemeContext";

const AnimatedBackground: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (!isDark) {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Light mode - gradient mesh base */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_15%,rgba(6,182,212,0.12),transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_85%,rgba(59,130,246,0.10),transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(20,184,166,0.07),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(99,102,241,0.06),transparent_50%)]" />

        {/* Floating orbs - light mode */}
        <div
          className="absolute -top-[8%] left-[5%] w-[650px] h-[650px] rounded-full animate-float-slow"
          style={{
            background: "radial-gradient(circle, rgba(6,182,212,0.16) 0%, rgba(6,182,212,0.05) 40%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute top-[25%] -right-[10%] w-[750px] h-[750px] rounded-full animate-float-medium"
          style={{
            background: "radial-gradient(circle, rgba(59,130,246,0.13) 0%, rgba(59,130,246,0.04) 40%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />
        <div
          className="absolute -bottom-[8%] left-[20%] w-[600px] h-[600px] rounded-full animate-float-reverse"
          style={{
            background: "radial-gradient(circle, rgba(20,184,166,0.11) 0%, rgba(20,184,166,0.03) 40%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute top-[10%] left-[50%] w-[400px] h-[400px] rounded-full animate-pulse-glow"
          style={{
            background: "radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 55%)",
            filter: "blur(30px)",
          }}
        />
        <div
          className="absolute top-[5%] right-[15%] w-[300px] h-[300px] rounded-full animate-float-medium"
          style={{
            background: "radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 60%)",
            filter: "blur(25px)",
            animationDelay: "-5s",
          }}
        />

        {/* Grid pattern - light */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Floating particles - light mode */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${3 + (i % 3) * 2}px`,
              height: `${3 + (i % 3) * 2}px`,
              left: `${12 + i * 14}%`,
              top: `${8 + (i * 15) % 80}%`,
              background: i % 3 === 0 ? "rgba(6,182,212,0.35)" : i % 3 === 1 ? "rgba(59,130,246,0.3)" : "rgba(20,184,166,0.3)",
              animation: `drift ${16 + i * 3}s linear infinite`,
              animationDelay: `${i * 2.5}s`,
            }}
          />
        ))}

        {/* Top shimmer line */}
        <div
          className="absolute top-0 left-0 right-0 h-px animate-shimmer opacity-40"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(6,182,212,0.5), rgba(59,130,246,0.5), transparent)",
          }}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Gradient mesh base */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(6,182,212,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(59,130,246,0.12),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(16,185,129,0.08),transparent_60%)]" />

      {/* Floating orb 1 - Cyan large */}
      <div
        className="absolute -top-[5%] left-[10%] w-[600px] h-[600px] rounded-full animate-float-slow"
        style={{
          background: "radial-gradient(circle, rgba(6,182,212,0.22) 0%, rgba(6,182,212,0.08) 40%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* Floating orb 2 - Blue large */}
      <div
        className="absolute top-[30%] -right-[8%] w-[700px] h-[700px] rounded-full animate-float-medium"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, rgba(59,130,246,0.06) 40%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Floating orb 3 - Teal */}
      <div
        className="absolute -bottom-[5%] left-[25%] w-[550px] h-[550px] rounded-full animate-float-reverse"
        style={{
          background: "radial-gradient(circle, rgba(20,184,166,0.15) 0%, rgba(20,184,166,0.05) 40%, transparent 70%)",
          filter: "blur(45px)",
        }}
      />

      {/* Floating orb 4 - Cyan accent center */}
      <div
        className="absolute top-[15%] left-[55%] w-[400px] h-[400px] rounded-full animate-pulse-glow"
        style={{
          background: "radial-gradient(circle, rgba(6,182,212,0.14) 0%, transparent 55%)",
          filter: "blur(35px)",
        }}
      />

      {/* Floating orb 5 - Blue small top-right */}
      <div
        className="absolute top-[5%] right-[20%] w-[250px] h-[250px] rounded-full animate-float-medium"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.16) 0%, transparent 60%)",
          filter: "blur(30px)",
          animationDelay: "-5s",
        }}
      />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${3 + (i % 3) * 2}px`,
            height: `${3 + (i % 3) * 2}px`,
            left: `${10 + i * 12}%`,
            top: `${5 + (i * 13) % 85}%`,
            background: i % 3 === 0 ? "rgba(6,182,212,0.6)" : i % 3 === 1 ? "rgba(59,130,246,0.5)" : "rgba(20,184,166,0.5)",
            animation: `drift ${14 + i * 3}s linear infinite`,
            animationDelay: `${i * 2}s`,
          }}
        />
      ))}

      {/* Top edge shimmer line */}
      <div
        className="absolute top-0 left-0 right-0 h-px animate-shimmer opacity-50"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(6,182,212,0.7), rgba(59,130,246,0.7), transparent)",
        }}
      />

      {/* Bottom edge shimmer line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px animate-shimmer opacity-30"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(20,184,166,0.6), rgba(6,182,212,0.6), transparent)",
          animationDelay: "-4s",
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
