import PointGroup from "./PointGroup.js";
import SimplePointGroup from "./SimplePointGroup.js";
import CREATE_MODES from "./CREATE_MODES.js";

export default class NestedPointGroup extends PointGroup {
    getOrCreateSubgroup(index, constructorDefaults, nested = false) {
        if (this[index]) {
            return this[index];
        }
        return this.insertSubgroup(index, constructorDefaults, nested);
    }

    insertSubgroup(index, constructorDefaults, nested = false) {
        if (index < 0 || index > this.length) {
            throw new Error(`insertSubgroup: index out of bounds: ${index}`);
        }
        let GroupConstructor = nested ? NestedPointGroup : SimplePointGroup;
        let newGroup = new GroupConstructor(this, index, constructorDefaults);
        this.splice(index, 0, newGroup);
        return newGroup;
    }

    getAllPoints() {
        return this.flatMap(group => group.getAllPoints());
    }

    removeAllPoints() {
        this.forEach(group => group.removeAllPoints());
    }

    navigate(ids, createMode = CREATE_MODES.DONT, constructorDefaults) {
        if (!Array.isArray(ids)) ids = [ids];
        if (ids.length === 0) return this;
        if (ids[0] < 0) ids[0] += this.length;
        let subgroup;
        switch (createMode) {
            case CREATE_MODES.DONT:
                subgroup = this[ids[0]];
                break;
            case CREATE_MODES.INSERT:
                if (ids.length == 1) {
                    subgroup = this.insertSubgroup(
                        ids[0],
                        constructorDefaults,
                        constructorDefaults.nested);
                    break;
                }
                // FALLTHROUGH otherwise
            case CREATE_MODES.IF_NOT_EXISTS:
                subgroup = this.getOrCreateSubgroup(
                    ids[0],
                    constructorDefaults,
                    constructorDefaults.nested || ids.length > 1);
                break;
        }
        if (!subgroup) throw new Error(`navigate: subgroup ${ids[0]} not found`);
        else if (subgroup.constructor === SimplePointGroup) {
            if (ids.length > 1) throw new Error(`navigate: subgroup ${ids[0]} is a SimplePointGroup and\
                 cannot have subgroups`);
            return subgroup;
        } else if (subgroup.constructor === NestedPointGroup) {
            if (ids.length == 1) return subgroup;
            else return subgroup.navigate(ids.slice(1), createMode, constructorDefaults);
        } else {
            throw new Error(`navigate: subgroup ${ids[0]} is of type ${subgroup.constructor.name}\
                 which is not a valid PointGroup`);
        }
    }
}