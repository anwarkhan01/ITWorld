import {useEffect, useRef, useState} from "react";

export default function RevealSection({
  as: Tag = "section",
  className = "",
  once = true,
  delay = 0,
  children,
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const t = setTimeout(() => setVisible(true), delay);
          if (once) io.disconnect();
          return () => clearTimeout(t);
        } else if (!once) {
          setVisible(false);
        }
      },
      {rootMargin: "0px 0px -10% 0px", threshold: 0.15}
    );

    io.observe(el);
    return () => io.disconnect();
  }, [once, delay]);

  return (
    <Tag
      ref={ref}
      className={[
        "transition-all duration-700 ease-out will-change-transform",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1",
        className,
      ].join(" ")}
    >
      {children}
    </Tag>
  );
}
