import { forwardRef, type SVGProps } from "react";

const IconEye = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
        <path
          d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  },
);

IconEye.displayName = "IconEye";

export { IconEye };
