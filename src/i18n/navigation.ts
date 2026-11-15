import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Versions de Link, redirect, usePathname… qui tiennent compte de la langue.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
