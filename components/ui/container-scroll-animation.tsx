"use client";
import React from "react";
import { motion } from "framer-motion";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center relative p-2 md:p-4">
      <div
        className="w-full flex-1 flex flex-col items-center justify-center relative"
        style={{
          perspective: "1000px",
        }}
      >
        <Header titleComponent={titleComponent} />
        <Card>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({
  titleComponent,
}: {
  titleComponent: string | React.ReactNode;
}) => {
  return (
    <motion.div
      initial={{ translateY: -30, opacity: 0 }}
      animate={{ translateY: 0, opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="max-w-5xl mx-auto text-center z-10"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      initial={{ rotateX: 20, scale: 0.9, y: 50, opacity: 0 }}
      animate={{ rotateX: 0, scale: 1, y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
      style={{
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className="max-w-5xl mx-auto h-[40vh] md:h-[55vh] w-full bg-[#0D0D0D] rounded-[30px] shadow-2xl relative z-20 mt-4"
    >
      <div className="h-full w-full overflow-hidden rounded-2xl bg-[#0D0D0D] md:rounded-2xl">
        {children}
      </div>
    </motion.div>
  );
};
