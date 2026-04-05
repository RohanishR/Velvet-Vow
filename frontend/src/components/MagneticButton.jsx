import { useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

/**
 * MagneticButton — wraps any child element (button, Link, anchor)
 * and adds a magnetic hover effect. All existing styling/effects
 * on the child are fully preserved.
 *
 * @param {React.ReactNode} children – the element(s) to wrap
 * @param {number} strength – how strongly the element attracts (0–1, default 0.35)
 * @param {number} radius – pixel radius in which magnetism activates (default 100)
 * @param {string} className – optional extra class for the wrapper
 * @param {object} style – optional extra inline style for the wrapper
 */
export default function MagneticButton({
  children,
  strength = 0.35,
  radius = 100,
  className = "",
  style = {},
}) {
  const wrapperRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Snappy elastic spring
  const springConfig = { stiffness: 200, damping: 18, mass: 0.6 };
  const rawX = useSpring(0, springConfig);
  const rawY = useSpring(0, springConfig);

  // Inner content moves less for parallax depth
  const innerX = useTransform(rawX, (v) => v * 0.45);
  const innerY = useTransform(rawY, (v) => v * 0.45);

  const handleMouseMove = (e) => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distX = e.clientX - centerX;
    const distY = e.clientY - centerY;
    const dist = Math.sqrt(distX ** 2 + distY ** 2);

    if (dist < radius) {
      rawX.set(distX * strength);
      rawY.set(distY * strength);
      if (!isHovered) setIsHovered(true);
    } else {
      rawX.set(0);
      rawY.set(0);
      if (isHovered) setIsHovered(false);
    }
  };

  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={wrapperRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`magnetic-wrap ${className}`}
      style={{
        display: "inline-flex",
        position: "relative",
        ...style,
      }}
    >
      {/* Outer container — follows mouse */}
      <motion.div
        style={{ x: rawX, y: rawY }}
        animate={{ scale: isHovered ? 1.045 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Inner content — slight parallax offset */}
        <motion.div style={{ x: innerX, y: innerY }}>
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
