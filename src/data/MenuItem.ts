import {IAdditionalIngredientsGroup} from "@/data/AdditionalIngredientsGroup";
import {firestore, storage} from "firebase/app";
import {firebaseStorage} from "@/plugins/firebase";

export interface IMenuItem {
    id: string;
    name: string;
    description: string;
    pictures: string[];
    ingredients: IMenuItemIngredient[];
    requiredChoices: IMenuItemRequiredChoice[];
    sizes: IMenuItemSize[];
    assignedAdditionalIngredientsGroups: firestore.DocumentReference<IAdditionalIngredientsGroup>[];
}

export interface IMenuItemIngredient {
    name: string;
    removable: boolean;
}

export interface IMenuItemRequiredChoice {
    name: string;
    choices: string[];
}

export interface IMenuItemSize {
    name: string;
    price: number;
}

export class MenuItem implements IMenuItem {
    constructor(
        public id: string = "",
        public name: string = "",
        public description: string = "",
        public pictures: string[] = [],
        public ingredients: IMenuItemIngredient[] = [],
        public requiredChoices: IMenuItemRequiredChoice[] = [],
        public sizes: IMenuItemSize[] = [{name: "", price: 0}],
        public assignedAdditionalIngredientsGroups: firestore.DocumentReference<IAdditionalIngredientsGroup>[] = []
    ) {
    }

    copy<T extends object = MenuItem>(to?: T): IMenuItem & T {
        return MenuItem.copy(this, to);
    }

    static copy<T extends object = MenuItem>(from: IMenuItem, to: T = new MenuItem() as T): IMenuItem & T {
        const copy = Object.assign(to, from);
        copy.pictures = copy.pictures.map(pictureId => pictureId);
        copy.ingredients = copy.ingredients.map(ingredient => MenuItemIngredient.copy(ingredient, to instanceof MenuItemIngredient ? undefined : {}));
        copy.requiredChoices = copy.requiredChoices.map(requiredChoice => MenuItemRequiredChoice.copy(requiredChoice, to instanceof MenuItemIngredient ? undefined : {}));
        copy.sizes = copy.sizes.map(size => MenuItemSize.copy(size, to instanceof MenuItemIngredient ? undefined : {}));
        copy.assignedAdditionalIngredientsGroups = copy.assignedAdditionalIngredientsGroups.map(assignedAdditionalIngredientsGroup => assignedAdditionalIngredientsGroup);
        return copy;
    }
}

export class MenuItemIngredient implements IMenuItemIngredient {
    constructor(public name: string = "", public removable: boolean = false) {
    }

    copy<T extends object = MenuItemIngredient>(to?: T): IMenuItemIngredient & T {
        return MenuItemIngredient.copy(this, to);
    }

    static copy<T extends object = MenuItemIngredient>(from: IMenuItemIngredient, to: T = new MenuItemIngredient() as T): IMenuItemIngredient & T {
        return Object.assign(to, from);
    }
}

export class MenuItemRequiredChoice implements IMenuItemRequiredChoice {
    constructor(public name: string = "", public choices: string[] = []) {
    }

    copy<T extends object = MenuItemRequiredChoice>(to?: T): IMenuItemRequiredChoice & T {
        return MenuItemRequiredChoice.copy(this, to);
    }

    static copy<T extends object = MenuItemRequiredChoice>(from: IMenuItemRequiredChoice, to: T = new MenuItemRequiredChoice() as T): IMenuItemRequiredChoice & T {
        return Object.assign(to, from);
    }
}

export class MenuItemSize implements IMenuItemSize {
    constructor(public name: string = "", public price: number = 0) {
    }

    copy<T extends object = MenuItemSize>(to?: T): IMenuItemSize & T {
        return MenuItemSize.copy(this, to);
    }

    static copy<T extends object = MenuItemSize>(from: IMenuItemSize, to: T = new MenuItemSize() as T): IMenuItemSize & T {
        return Object.assign(to, from);
    }
}

export function getMenuItemPicturesStorageRef(providerId: string, menuItemId: string): storage.Reference {
    return firebaseStorage.ref(`/providers/${providerId}/menu-items/${menuItemId}/pictures`);
}
