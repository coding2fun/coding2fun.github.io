import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://coding2fun.in/",
  author: "Kishore Karunakaran",
  desc: "Coding2Fun, Ideas to Life",
  title: "Coding2Fun",
  ogImage: "coding2fun-og.png",
  lightAndDarkMode: true,
  postPerPage: 3,
};

export const LOCALE = ["en-EN"]; // set to [] to use the environment default

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

LOGO_IMAGE.svg = false;

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/khekrn",
    linkTitle: ` ${SITE.title} on Github`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/khekrn/",
    linkTitle: `${SITE.title} on LinkedIn`,
    active: true,
  },
];
