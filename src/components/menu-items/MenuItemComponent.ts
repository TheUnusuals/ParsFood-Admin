import Vue from "vue";

declare module "@/components/menu-items/MenuItemComponent.vue" {
    // @ts-ignore
    export default class MenuItemComponent extends Vue {
        savePictures(menuItemId?: string): Promise<string[]>;
    }
}
