'use client';

import type { ReactNode } from 'react';
import { motion } from 'motion/react';

interface MotionSectionProps {
  children: ReactNode;
  className?: string;
}

export function MotionSection({ children, className }: MotionSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0.98, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
