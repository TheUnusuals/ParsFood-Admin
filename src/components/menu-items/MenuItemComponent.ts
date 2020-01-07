import Vue from "vue";

declare module "@/components/menu-items/MenuItemComponent.vue" {
    // @ts-config
    export default class MenuItemComponent extends Vue {
        savePictures(menuItemId?: string): Promise<string[]>;
    }
}
