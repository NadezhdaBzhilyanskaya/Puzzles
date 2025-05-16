import { InitiativeRowFormInputs } from "./types";

export const QUICK_ADDS: InitiativeRowFormInputs[] = [{
    name: "Kobold Warrior",
    amount: "1d4",
    initiative: "d20",
    ac: "14",
    hp: "3d6-3",
    abilities: {
        str: "7",
        dex: "15",
        con: "9",
        int: "8",
        wis: "7",
        cha: "8"
    },
    mod: {
   str: "-2",
   dex: "+2",
   con: "-1",
   int: "-1",
   wis: "-2",
   cha: "-1"
    },
    save: {
   str: "-2",
   dex: "+2",
   con: "-1",
   int: "-1",
   wis: "-2",
   cha: "-1"
    },
    attacks: [
        {
       name: "Dagger",
       toHit: "d20+4",
       damage: "1d4+2"
        }
    ]
}];