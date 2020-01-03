export interface IAdditionalIngredientsGroup {
    id: string;
    name: string;
    ingredients: IAdditionalIngredient[];
}

export interface IAdditionalIngredient {
    name: string;
    price: number;
}

export class AdditionalIngredientsGroup implements IAdditionalIngredientsGroup {
    constructor(public id: string = "", public name: string = "", public ingredients: AdditionalIngredient[] = []) {
    }

    copy<T extends object = AdditionalIngredientsGroup>(to?: T): IAdditionalIngredientsGroup & T {
        return AdditionalIngredientsGroup.copy(this, to);
    }

    static copy<T extends object = AdditionalIngredientsGroup>(from: IAdditionalIngredientsGroup, to: T = new AdditionalIngredientsGroup() as T): IAdditionalIngredientsGroup & T {
        const copy = Object.assign(to, from);
        copy.ingredients = copy.ingredients.map(
            additionalIngredient => AdditionalIngredient.copy(additionalIngredient, to instanceof AdditionalIngredientsGroup ? undefined : {})
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
