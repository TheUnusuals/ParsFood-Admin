export interface IProvider {
    id: string;
    name: string;
    phoneNumber: string;
    email: string;
    websiteUrl: string;
    logo?: string;
    assignedAdmins: string[];
}

export class Provider implements IProvider {
    constructor(
        public id: string = "",
        public name: string = "",
        public phoneNumber: string = "",
        public email: string = "",
        public websiteUrl: string = "",
        public logo: string | undefined = undefined,
        public assignedAdmins: string[] = []
    ) {
    }

    copy<T extends object = Provider>(to?: T): IProvider & T {
        return Provider.copy(this, to);
    }

    static copy<T extends object = Provider>(from: IProvider, to: T = new Provider() as T): IProvider & T {
        const copy = Object.assign(to, from);
        copy.assignedAdmins = copy.assignedAdmins.map(adminId => adminId);
        return copy;
    }
}
