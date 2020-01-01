export interface IAdditionalIngredientGroup {
    id: string;
    name: string;
    ingredients: IAdditionalIngredient[];
}

export interface IAdditionalIngredient {
    name: string;
    price: number;
}

export class AdditionalIngredientGroup implements IAdditionalIngredientGroup {
    constructor(public id: string = "", public name: string = "", public ingredients: AdditionalIngredient[] = []) {
    }

    copy<T extends object = AdditionalIngredientGroup>(to?: T): IAdditionalIngredientGroup & T {
        return AdditionalIngredientGroup.copy(this, to);
    }

    static copy<T extends object = AdditionalIngredientGroup>(from: IAdditionalIngredientGroup, to: T = new AdditionalIngredientGroup() as T): IAdditionalIngredientGroup & T {
        const copy = Object.assign(to, from);
        copy.ingredients = copy.ingredients.map(
            additionalIngredient => AdditionalIngredient.copy(additionalIngredient, to instanceof AdditionalIngredientGroup ? undefined : {})
        );
        return copy;
    }
}

export class AdditionalIngredient implements IAdditionalIngredient {
    constructor(public name: string = "", public price: number = 0) {
    }

    copy<T extends object = AdditionalIngredient>(to?: T): IAdditionalIngredient & T {
        return AdditionalIngredient.copy(this, to);
    }

    static copy<T extends object = AdditionalIngredient>(from: IAdditionalIngredient, to: T = new AdditionalIngredient() as T): IAdditionalIngredient & T {
        return Object.assign(to, from);
    }
}
