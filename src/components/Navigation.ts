import {RawLocation} from "vue-router";

export type NavigationGroup = {
    title?: string;
    links?: NavigationLink[];
};

export type NavigationLink = {
    icon?: string;
    title: string;
    to?: RawLocation;
    click?: () => void;
    children?: NavigationLink[];
};
