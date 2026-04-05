import { useState } from "react";
import { motion } from "framer-motion";

/**
 * GeometricSplitText — Text splits vertically on hover, revealing subText inside the gap.
 *
 * @param {string} text – Primary display text (splits in half)
 * @param {string} subText – Text revealed inside the split
 * @param {object} style – Optional container style overrides
 * @param {object} textStyle – Optional main text style overrides
 * @param {object} subTextStyle – Optional subtext style overrides
 * @param {number} splitDistance – How far the halves separate (px, default 24)
 */
export default function GeometricSplitText({
  text,
  subText,
  style = {},
  textStyle = {},
  subTextStyle = {},
  splitDistance = 24,
}) {
  const [isHovered, setIsHovered] = useState(false);

  const baseTextStyle = {
    fontSize: "64px",
    fontWeight: 800,
    lineHeight: 1.1,
    letterSpacing: "-1.5px",
    color: "var(--secondary)",
    userSelect: "none",
    ...textStyle,
  };

  const baseSubTextStyle = {
    fontSize: "18px",
    color: "var(--text-muted)",
    fontWeight: 500,
    letterSpacing: "0px",
    ...subTextStyle,
  };

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        ...style,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      <div style={{ position: "relative" }}>

        {/* ─── Top Half ─── */}
        <motion.div
          animate={{ y: isHovered ? -splitDistance : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          style={{
            ...baseTextStyle,
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)",
          }}
        >
          <span>{text}</span>
        </motion.div>

        {/* ─── Bottom Half (sets the layout size) ─── */}
        <motion.div
          animate={{ y: isHovered ? splitDistance : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          style={{
            ...baseTextStyle,
            position: "relative",
            overflow: "hidden",
            clipPath: "polygon(0 50%, 100% 50%, 100% 100%, 0 100%)",
          }}
        >
          <span>{text}</span>
        </motion.div>

        {/* ─── SubText inside the split void ─── */}
        {subText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: isHovered ? 1 : 0,
              scale: isHovered ? 1 : 0.8,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              delay: isHovered ? 0.05 : 0,
            }}
            style={{
              ...baseSubTextStyle,
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              marginTop: "1px",
            }}
          >
            {subText}
          </motion.div>
        )}
      </div>
    </div>
  );
}
