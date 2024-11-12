import PointGroup from "./PointGroup.js";
import SimplePointGroup from "./SimplePointGroup.js";

export default class NestedPointGroup extends PointGroup {
    getOrCreateSubgroup(index, constructorDefaults, nested = true) {
        if (this[index]) {
            return this[index];
        }
        if (index < 0 || index > this.length) {
            throw new Error(`getOrCreateSubgroup: index out of bounds: ${index}`);
        }
        let GroupConstructor = nested ? NestedPointGroup : SimplePointGroup;
        let newGroup = new GroupConstructor(this, index, constructorDefaults);
        this.push(newGroup);
        return newGroup;
    }

    getAllPoints() {
        return this.flatMap(group => group.getAllPoints());
    }

    removeAllPoints() {
        this.forEach(group => group.removeAllPoints());
    }

    navigate(ids, createifNotExists = false, constructorDefaults) {
        if (Array.isArray(ids) && ids.length === 0) return this;
        if (ids[0] < 0) ids[0] += this.length;
        let subgroup = createifNotExists ?
             this.getOrCreateSubgroup(
                ids[0],
                constructorDefaults, 
                constructorDefaults.nested || ids.length > 1) :
             this[ids[0]];
        if (!subgroup) throw new Error(`navigate: subgroup ${ids[0]} not found`);
        if (subgroup.constructor === SimplePointGroup) {
            if (ids.length > 1) throw new Error(`navigate: subgroup ${ids[0]} is a SimplePointGroup and\
                 cannot have subgroups`);
            return subgroup;
        } else if (subgroup.constructor === NestedPointGroup) {
            if (ids.length == 1) return subgroup;
            else return this[ids[0]]?.navigate(ids.slice(1), createifNotExists, constructorDefaults);
        } else {
            throw new Error(`navigate: subgroup ${ids[0]} is of type ${subgroup.constructor.name}\
                 which is not a valid PointGroup`);
        }
    }
}