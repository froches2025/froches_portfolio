"use client";

import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * First-paint amber line sweep + one flicker of a coordinate readout.
 * Skips entirely under reduced motion.
 */
export function LoadSequence() {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(!reduced);

  useEffect(() => {
    if (reduced) return;
    const t = setTimeout(() => setVisible(false), 650);
    return () => clearTimeout(t);
  }, [reduced]);

  if (reduced) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="pointer-events-none fixed inset-x-0 top-0 z-[100]"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="h-[2px] bg-signal-amber"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "left" }}
          />
          <motion.div
            className="absolute right-4 top-3 font-mono text-[10px] tracking-widest text-data-cyan"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.3, 1, 0] }}
            transition={{ duration: 0.6, times: [0, 0.2, 0.4, 0.6, 1] }}
          >
            SYS.INIT · 0B0D10
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
