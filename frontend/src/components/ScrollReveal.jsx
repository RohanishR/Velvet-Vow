import { useRef } from "react";
import { motion, useInView } from "framer-motion";

/**
 * ScrollReveal — Wraps children with a scroll-triggered entrance animation.
 *
 * @param {"fade-up"|"fade-down"|"fade-left"|"fade-right"|"zoom"|"blur"} variant
 * @param {number} delay — stagger delay in seconds (default 0)
 * @param {number} duration — animation duration (default 0.7)
 * @param {number} distance — translate distance in px (default 60)
 * @param {boolean} once — animate only once (default true)
 * @param {object} style — additional container styles
 */
export default function ScrollReveal({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 0.7,
  distance = 60,
  once = true,
  style = {},
  className = "",
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-80px 0px" });

  const variants = {
    "fade-up":    { hidden: { opacity: 0, y: distance },       visible: { opacity: 1, y: 0 } },
    "fade-down":  { hidden: { opacity: 0, y: -distance },      visible: { opacity: 1, y: 0 } },
    "fade-left":  { hidden: { opacity: 0, x: -distance },      visible: { opacity: 1, x: 0 } },
    "fade-right": { hidden: { opacity: 0, x: distance },       visible: { opacity: 1, x: 0 } },
    "zoom":       { hidden: { opacity: 0, scale: 0.85 },       visible: { opacity: 1, scale: 1 } },
    "blur":       { hidden: { opacity: 0, filter: "blur(12px)" }, visible: { opacity: 1, filter: "blur(0px)" } },
  };

  const chosen = variants[variant] || variants["fade-up"];

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={chosen}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}
