import {extend, localize} from "vee-validate";
import {email, min_value, required} from "vee-validate/dist/rules";
import {i18n} from "@/plugins/i18n";

import en from "vee-validate/dist/locale/en.json";
import lt from "vee-validate/dist/locale/lt.json";

extend("required", required);
extend("email", email);
extend("min_value", min_value);

localize({en, lt});
localize(i18n.locale);
