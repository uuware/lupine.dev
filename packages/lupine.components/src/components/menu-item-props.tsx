export type MenuItemProps = {
  text: string; // "-" for break line
  url: string;
  js?: () => void;
  alt?: string;
};

export type NestMenuItemProps = MenuItemProps & {
  items?: NestMenuItemProps[];
};
