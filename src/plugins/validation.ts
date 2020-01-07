import {configure, extend} from "vee-validate";
import {email, image, min_value, required} from "vee-validate/dist/rules";
import {i18n} from "@/plugins/i18n";

extend("required", required);
extend("email", email);
extend("min_value", min_value);
extend("image", image);

extend("min_length", {
    validate(value, {length}) {
        return value.length >= length
    },
    params: ["length"]
});

configure({
    defaultMessage: (field, values: any) => {
        return i18n.t(`$vee-validate.${values._rule_}`, values) as string;
    }
});
