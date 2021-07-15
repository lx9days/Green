import { parseNgesSelector } from './parser-context';
import { renderEntity } from './render';
export class NgesSelectorParser {
    constructor() {
        this.pseudos = {};
        this.attrEqualityMods = {};
        this.ruleNestingOperators = {};
        this.substitutesEnabled = false;
    }
    registerSelectorPseudos(...pseudos) {
        for (let pseudo of pseudos) {
            this.pseudos[pseudo] = 'selector';
        }
        return this;
    }
    unregisterSelectorPseudos(...pseudos) {
        for (let pseudo of pseudos) {
            delete this.pseudos[pseudo];
        }
        return this;
    }
    registerNumericPseudos(...pseudos) {
        for (let pseudo of pseudos) {
            this.pseudos[pseudo] = 'numeric';
        }
        return this;
    }
    unregisterNumericPseudos(...pseudos) {
        for (let pseudo of pseudos) {
            delete this.pseudos[pseudo];
        }
        return this;
    }
    registerNestingOperators(...operators) {
        for (let operator of operators) {
            this.ruleNestingOperators[operator] = true;
        }
        return this;
    }
    unregisterNestingOperators(...operators) {
        for (let operator of operators) {
            delete this.ruleNestingOperators[operator];
        }
        return this;
    }
    registerAttrEqualityMods(...mods) {
        for (let mod of mods) {
            this.attrEqualityMods[mod] = true;
        }
        return this;
    }
    unregisterAttrEqualityMods(...mods) {
        for (let mod of mods) {
            delete this.attrEqualityMods[mod];
        }
        return this;
    }
    enableSubstitutes() {
        this.substitutesEnabled = true;
        return this;
    }
    disableSubstitutes() {
        this.substitutesEnabled = false;
        return this;
    }
    parse(str) {
        return parseNgesSelector(str, 0, this.pseudos, this.attrEqualityMods, this.ruleNestingOperators, this.substitutesEnabled);
    }
    render(path) {
        return renderEntity(path).trim();
    }
}