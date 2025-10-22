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
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const timer = setTimeout(() => setVisible(true), delay);
            if (once) observer.unobserve(element);
            return () => clearTimeout(timer);
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      {
        root: null,
        threshold: 0, // trigger immediately when any part enters
        rootMargin: "0px 0px -50% 0px", // start animation when element is halfway from viewport bottom
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [once, delay]);

  return (
    <Tag
      ref={ref}
      className={`${className} transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } will-change-transform`}
    >
      {children}
    </Tag>
  );
}
