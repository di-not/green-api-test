import { forwardRef, type SVGProps } from "react";

const IconUser = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  (props, ref) => {
    return (
      <svg
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
        fill="none"
        {...props}
        ref={ref}
      >
        <circle cx="12" cy="8" r="3.5" fill="currentColor" />
        <path
          d="M5.5 19c0-3.2 2.9-5.5 6.5-5.5s6.5 2.3 6.5 5.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
        />
      </svg>
    );
  },
);

IconUser.displayName = "IconUser";

export { IconUser };
