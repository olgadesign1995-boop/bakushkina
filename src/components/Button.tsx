import clsx from "clsx";
import type { ComponentPropsWithoutRef } from "react";

import styles from "./Button.module.css";

type Variant = "primary" | "ghost" | "quiet";

type CommonProps = {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsLink = CommonProps & { href: string } & Omit<
    ComponentPropsWithoutRef<"a">,
    "href" | "className" | "children"
  >;

type ButtonAsButton = CommonProps & { href?: undefined } & Omit<
    ComponentPropsWithoutRef<"button">,
    "className" | "children"
  >;

export function Button(props: ButtonAsLink | ButtonAsButton) {
  const classes = clsx(styles.base, styles[props.variant ?? "primary"], props.className);

  if (props.href !== undefined) {
    const { href, children, ...rest } = props;
    delete (rest as Partial<CommonProps>).variant;
    delete (rest as Partial<CommonProps>).className;

    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  const { children, ...rest } = props;
  delete (rest as Partial<CommonProps>).variant;
  delete (rest as Partial<CommonProps>).className;

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
