import { motion, type Variants } from "framer-motion";
import { type ReactNode } from "react";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemFadeUp: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] },
  },
};

const itemFadeLeft: Variants = {
  hidden: { opacity: 0, x: -40, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] },
  },
};

const itemFadeRight: Variants = {
  hidden: { opacity: 0, x: 40, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] },
  },
};

const itemScale: Variants = {
  hidden: { opacity: 0, scale: 0.85, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] },
  },
};

export const variants = {
  fadeUp: itemFadeUp,
  fadeLeft: itemFadeLeft,
  fadeRight: itemFadeRight,
  scale: itemScale,
};

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  margin?: string;
}

export const StaggerContainer = ({
  children,
  className = "",
  delay = 0.1,
  margin = "-80px",
}: StaggerContainerProps) => (
  <motion.div
    variants={{
      ...containerVariants,
      visible: {
        transition: { staggerChildren: 0.12, delayChildren: delay },
      },
    }}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin }}
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({
  children,
  className = "",
  variant = "fadeUp",
}: {
  children: ReactNode;
  className?: string;
  variant?: keyof typeof variants;
}) => (
  <motion.div variants={variants[variant]} className={className}>
    {children}
  </motion.div>
);
